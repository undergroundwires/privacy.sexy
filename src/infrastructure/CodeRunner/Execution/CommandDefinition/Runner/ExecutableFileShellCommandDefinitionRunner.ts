import type { CodeRunErrorType } from '@/application/CodeRunner/CodeRunner';
import { FileSystemExecutablePermissionSetter } from './PermissionSetter/FileSystemExecutablePermissionSetter';
import { LoggingNodeShellCommandRunner } from './ShellRunner/LoggingNodeShellCommandRunner';
import type { FailedScriptFileExecution, ScriptFileExecutionOutcome } from '../../ScriptFileExecutor';
import type { CommandDefinition } from '../CommandDefinition';
import type { CommandDefinitionRunner } from './CommandDefinitionRunner';
import type { ExecutablePermissionSetter } from './PermissionSetter/ExecutablePermissionSetter';
import type { ShellCommandOutcome, ShellCommandRunner } from './ShellRunner/ShellCommandRunner';

export class ExecutableFileShellCommandDefinitionRunner implements CommandDefinitionRunner {
  constructor(
    private readonly executablePermissionSetter: ExecutablePermissionSetter
    = new FileSystemExecutablePermissionSetter(),
    private readonly shellCommandRunner: ShellCommandRunner
    = new LoggingNodeShellCommandRunner(),
  ) { }

  public async runCommandDefinition(
    commandDefinition: CommandDefinition,
    filePath: string,
  ): Promise<ScriptFileExecutionOutcome> {
    if (commandDefinition.isExecutablePermissionsRequiredOnFile()) {
      const filePermissionsResult = await this.executablePermissionSetter
        .makeFileExecutable(filePath);
      if (!filePermissionsResult.success) {
        return filePermissionsResult;
      }
    }
    const command = commandDefinition.buildShellCommand(filePath);
    const shellOutcome = await this.shellCommandRunner.runShellCommand(command);
    return interpretShellOutcome(shellOutcome, commandDefinition);
  }
}

function interpretShellOutcome(
  outcome: ShellCommandOutcome,
  commandDefinition: CommandDefinition,
): ScriptFileExecutionOutcome {
  switch (outcome.type) {
    case 'RegularProcessExit':
      if (outcome.exitCode === 0) {
        return { success: true };
      }
      if (commandDefinition.isExecutionTerminatedExternally(outcome.exitCode)) {
        return createFailureOutcome(
          'ExternalProcessTermination',
          `Process terminated externally: Exit code ${outcome.exitCode}.`,
        );
      }
      return createFailureOutcome(
        'FileExecutionError',
        `Unexpected exit code: ${outcome.exitCode}.`,
      );
    case 'ExternallyTerminated':
      return createFailureOutcome(
        'ExternalProcessTermination',
        `Process terminated by signal ${outcome.terminationSignal}.`,
      );
    case 'ExecutionError':
      return createFailureOutcome(
        'FileExecutionError',
        `Execution error: ${outcome.error.message}.`,
      );
    default:
      throw new Error(`Unknown outcome type: ${outcome}`);
  }
}

function createFailureOutcome(
  type: CodeRunErrorType,
  errorMessage: string,
): FailedScriptFileExecution {
  return {
    success: false,
    error: {
      type,
      message: `Error during command execution: ${errorMessage}`,
    },
  };
}
