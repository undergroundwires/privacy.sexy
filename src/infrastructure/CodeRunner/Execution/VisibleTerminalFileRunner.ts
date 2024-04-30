import type { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { OsSpecificTerminalLaunchCommandFactory } from './CommandDefinition/Factory/OsSpecificTerminalLaunchCommandFactory';
import { ExecutableFileShellCommandDefinitionRunner } from './CommandDefinition/Runner/ExecutableFileShellCommandDefinitionRunner';
import type { ScriptFileExecutionOutcome, ScriptFileExecutor } from './ScriptFileExecutor';
import type { CommandDefinitionFactory } from './CommandDefinition/Factory/CommandDefinitionFactory';
import type { CommandDefinitionRunner } from './CommandDefinition/Runner/CommandDefinitionRunner';
import type { CommandDefinition } from './CommandDefinition/CommandDefinition';

export class VisibleTerminalFileRunner implements ScriptFileExecutor {
  constructor(
    private readonly logger: Logger = ElectronLogger,
    private readonly commandFactory: CommandDefinitionFactory
    = new OsSpecificTerminalLaunchCommandFactory(),
    private readonly commandRunner: CommandDefinitionRunner
    = new ExecutableFileShellCommandDefinitionRunner(),
  ) { }

  public async executeScriptFile(
    filePath: string,
  ): Promise<ScriptFileExecutionOutcome> {
    this.logger.info(`Executing script file: ${filePath}.`);
    const outcome = await this.findAndExecuteCommand(filePath);
    this.logOutcome(outcome);
    return outcome;
  }

  private async findAndExecuteCommand(
    filePath: string,
  ): Promise<ScriptFileExecutionOutcome> {
    try {
      let commandDefinition: CommandDefinition;
      try {
        commandDefinition = this.commandFactory.provideCommandDefinition();
      } catch (error) {
        return {
          success: false,
          error: {
            type: 'UnsupportedPlatform',
            message: `Error finding command: ${error.message}`,
          },
        };
      }
      const runOutcome = await this.commandRunner.runCommandDefinition(
        commandDefinition,
        filePath,
      );
      return runOutcome;
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'FileExecutionError',
          message: `Unexpected error: ${error.message}`,
        },
      };
    }
  }

  private logOutcome(outcome: ScriptFileExecutionOutcome) {
    if (outcome.success) {
      this.logger.info('Executed script file in terminal successfully.');
      return;
    }
    this.logger.error(
      'Failed to execute the script file in terminal.',
      outcome.error.type,
      outcome.error.message,
    );
  }
}
