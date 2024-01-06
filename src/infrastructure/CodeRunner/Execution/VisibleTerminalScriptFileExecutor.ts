import { OperatingSystem } from '@/domain/OperatingSystem';
import { CommandOps, SystemOperations } from '@/infrastructure/CodeRunner/System/SystemOperations';
import { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { NodeElectronSystemOperations } from '@/infrastructure/CodeRunner/System/NodeElectronSystemOperations';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { ScriptFileExecutor } from './ScriptFileExecutor';

export class VisibleTerminalScriptExecutor implements ScriptFileExecutor {
  constructor(
    private readonly system: SystemOperations = new NodeElectronSystemOperations(),
    private readonly logger: Logger = ElectronLogger,
    private readonly environment: RuntimeEnvironment = CurrentEnvironment,
  ) { }

  public async executeScriptFile(filePath: string): Promise<void> {
    const { os } = this.environment;
    if (os === undefined) {
      throw new Error('Unknown operating system');
    }
    await this.setFileExecutablePermissions(filePath);
    await this.runFileWithRunner(filePath, os);
  }

  private async setFileExecutablePermissions(filePath: string): Promise<void> {
    this.logger.info(`Setting execution permissions for file at ${filePath}`);
    await this.system.fileSystem.setFilePermissions(filePath, '755');
    this.logger.info(`Execution permissions set successfully for ${filePath}`);
  }

  private async runFileWithRunner(filePath: string, os: OperatingSystem): Promise<void> {
    this.logger.info(`Executing script file: ${filePath} on ${OperatingSystem[os]}.`);
    const runner = TerminalRunners[os];
    if (!runner) {
      throw new Error(`Unsupported operating system: ${OperatingSystem[os]}`);
    }
    const context: TerminalExecutionContext = {
      scriptFilePath: filePath,
      commandOps: this.system.command,
      logger: this.logger,
    };
    await runner(context);
    this.logger.info('Command script file successfully.');
  }
}

interface TerminalExecutionContext {
  readonly scriptFilePath: string;
  readonly commandOps: CommandOps;
  readonly logger: Logger;
}

type TerminalRunner = (context: TerminalExecutionContext) => Promise<void>;

const TerminalRunners: Partial<Record<OperatingSystem, TerminalRunner>> = {
  [OperatingSystem.Windows]: async (context) => {
    /*
      Options:
        "path":
          ✅ Launches the script within `cmd.exe`.
          ✅ Uses user-friendly GUI sudo prompt.
    */
    const command = cmdShellPathArgumentEscape(context.scriptFilePath);
    await runCommand(command, context);
  },
  [OperatingSystem.Linux]: async (context) => {
    const command = `x-terminal-emulator -e ${posixShellPathArgumentEscape(context.scriptFilePath)}`;
    /*
      Options:
        `x-terminal-emulator -e`:
          ✅ Launches the script within the default terminal emulator.
          ❌ Requires terminal-based (not GUI) sudo prompt, which may not be very user friendly.
    */
    await runCommand(command, context);
  },
  [OperatingSystem.macOS]: async (context) => {
    const command = `open -a Terminal.app ${posixShellPathArgumentEscape(context.scriptFilePath)}`;
    /*
      Options:
        `open -a Terminal.app`:
          ✅ Launches the script within Terminal app, that exists natively in all modern macOS
             versions.
          ❌ Requires terminal-based (not GUI) sudo prompt, which may not be very user friendly.
          ❌ Terminal app requires many privileges to execute the script, this would prompt user
             to grant privileges to the Terminal app.

        `osascript -e "do shell script \\"${scriptPath}\\" with administrator privileges"`:
          ✅ Uses user-friendly GUI sudo prompt.
          ❌ Executes the script in the background, which does not provide the user with immediate
             visual feedback or allow interaction with the script as it runs.
    */
    await runCommand(command, context);
  },
} as const;

async function runCommand(command: string, context: TerminalExecutionContext): Promise<void> {
  context.logger.info(`Executing command:\n${command}`);
  await context.commandOps.exec(command);
  context.logger.info('Executed command successfully.');
}

function posixShellPathArgumentEscape(pathArgument: string): string {
  // - Wraps the path in single quotes, which is a standard practice in POSIX shells
  //   (like bash and zsh) found on macOS/Linux to ensure that characters like spaces, '*', and
  //   '?' are treated as literals, not as special characters.
  // - Escapes any single quotes within the path itself. This allows paths containing single
  //   quotes to be correctly interpreted in POSIX-compliant systems, such as Linux and macOS.
  return `'${pathArgument.replaceAll('\'', '\'\\\'\'')}'`;
}

function cmdShellPathArgumentEscape(pathArgument: string): string {
  // - Encloses the path in double quotes, which is necessary for Windows command line (cmd.exe)
  //   to correctly handle paths containing spaces.
  // - Paths in Windows cannot include double quotes `"` themselves, so these are not escaped.
  return `"${pathArgument}"`;
}
