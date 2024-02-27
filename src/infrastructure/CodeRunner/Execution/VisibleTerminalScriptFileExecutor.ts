import { OperatingSystem } from '@/domain/OperatingSystem';
import type { CommandOps, SystemOperations } from '@/infrastructure/CodeRunner/System/SystemOperations';
import type { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import type { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { NodeElectronSystemOperations } from '@/infrastructure/CodeRunner/System/NodeElectronSystemOperations';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import type { CodeRunErrorType } from '@/application/CodeRunner/CodeRunner';
import { isString } from '@/TypeHelpers';
import type { FailedScriptFileExecution, ScriptFileExecutionOutcome, ScriptFileExecutor } from './ScriptFileExecutor';

export class VisibleTerminalScriptExecutor implements ScriptFileExecutor {
  constructor(
    private readonly system: SystemOperations = new NodeElectronSystemOperations(),
    private readonly logger: Logger = ElectronLogger,
    private readonly environment: RuntimeEnvironment = CurrentEnvironment,
  ) { }

  public async executeScriptFile(filePath: string): Promise<ScriptFileExecutionOutcome> {
    const { os } = this.environment;
    if (os === undefined) {
      return this.handleError('UnsupportedOperatingSystem', 'Operating system could not be identified from environment.');
    }
    const filePermissionsResult = await this.setFileExecutablePermissions(filePath);
    if (!filePermissionsResult.success) {
      return filePermissionsResult;
    }
    const scriptExecutionResult = await this.runFileWithRunner(filePath, os);
    if (!scriptExecutionResult.success) {
      return scriptExecutionResult;
    }
    return {
      success: true,
    };
  }

  private async setFileExecutablePermissions(
    filePath: string,
  ): Promise<ScriptFileExecutionOutcome> {
    /*
      This is required on macOS and Linux otherwise the terminal emulators will refuse to
      execute the script. It's not needed on Windows.
    */
    try {
      this.logger.info(`Setting execution permissions for file at ${filePath}`);
      await this.system.fileSystem.setFilePermissions(filePath, '755');
      this.logger.info(`Execution permissions set successfully for ${filePath}`);
      return { success: true };
    } catch (error) {
      return this.handleError('FileExecutionError', error);
    }
  }

  private async runFileWithRunner(
    filePath: string,
    os: OperatingSystem,
  ): Promise<ScriptFileExecutionOutcome> {
    this.logger.info(`Executing script file: ${filePath} on ${OperatingSystem[os]}.`);
    const runner = TerminalRunners[os];
    if (!runner) {
      return this.handleError('UnsupportedOperatingSystem', `Unsupported operating system: ${OperatingSystem[os]}`);
    }
    const context: TerminalExecutionContext = {
      scriptFilePath: filePath,
      commandOps: this.system.command,
      logger: this.logger,
    };
    try {
      await runner(context);
      this.logger.info('Command script file successfully.');
      return { success: true };
    } catch (error) {
      return this.handleError('FileExecutionError', error);
    }
  }

  private handleError(
    type: CodeRunErrorType,
    error: Error | string,
  ): FailedScriptFileExecution {
    const errorMessage = 'Error during script file execution';
    this.logger.error([type, errorMessage, ...(error ? [error] : [])]);
    return {
      success: false,
      error: {
        type,
        message: `${errorMessage}: ${isString(error) ? error : errorMessage}`,
      },
    };
  }
}

interface TerminalExecutionContext {
  readonly scriptFilePath: string;
  readonly commandOps: CommandOps;
  readonly logger: Logger;
}

type TerminalRunner = (context: TerminalExecutionContext) => Promise<void>;

export const LinuxTerminalEmulator = 'x-terminal-emulator';

const TerminalRunners: Partial<Record<OperatingSystem, TerminalRunner>> = {
  [OperatingSystem.Windows]: async (context) => {
    const command = [
      'PowerShell',
      'Start-Process',
      '-Verb RunAs', // Run as administrator with GUI sudo prompt
      `-FilePath ${cmdShellPathArgumentEscape(context.scriptFilePath)}`,
    ].join(' ');
    /*
      📝 Options:
        `child_process.execFile()`
        "path", `cmd.exe /c "path"`
          ❌  Script execution in the background without a visible terminal.
              This occurs only when the user runs the application as administrator, as seen
              in Windows Pro VMs on Azure.
        `PowerShell Start -Verb RunAs "path"`
          ✅  Visible terminal window
          ✅  GUI sudo prompt (through `RunAs` option)
        `PowerShell Start "path"`
        `explorer.exe "path"`
        `electron.shell.openPath`
        `start cmd.exe /c "$path"`
          ✅  Visible terminal window
          ✅  GUI sudo prompt (through `RunAs` option)
          👍  Among all options `start` command is the most explicit one, being the most resilient
              against the potential changes in Windows or Electron framework (e.g. https://github.com/electron/electron/issues/36765).
              `%COMSPEC%` environment variable should be checked before defaulting to `cmd.exe.
      Related docs: https://web.archive.org/web/20240106002357/https://nodejs.org/api/child_process.html#spawning-bat-and-cmd-files-on-windows
    */
    await runCommand(command, context);
  },
  [OperatingSystem.Linux]: async (context) => {
    const command = `${LinuxTerminalEmulator} -e ${posixShellPathArgumentEscape(context.scriptFilePath)}`;
    /*
      🤔 Potential improvements:
          Use user-friendly GUI sudo prompt (not terminal-based).
          If `pkexec` exists, we could do `x-terminal-emulator -e pkexec 'path'`, which always
          prompts with user-friendly GUI sudo prompt.
      📝 Options:
        `x-terminal-emulator -e 'path'`:
            ✅  Visible terminal window
            ❌  Terminal-based (not GUI) sudo prompt.
        `x-terminal-emulator -e pkexec 'path'
          ✅  Visible terminal window
          ✅  Always prompts with user-friendly GUI sudo prompt.
          🤔  Not using `pkexec` as it is not in all Linux distributions. It should have smarter
              logic to handle if it does not exist.
        `electron.shell.openPath`:
          ❌  Opens the script in the default text editor, verified on
              Debian/Ubuntu-based distributions.
        `child_process.execFile()`:
          ❌  Script execution in the background without a visible terminal.
    */
    await runCommand(command, context);
  },
  [OperatingSystem.macOS]: async (context) => {
    const command = `open -a Terminal.app ${posixShellPathArgumentEscape(context.scriptFilePath)}`;
    // -a Specifies the application to use for opening the file
    /* eslint-disable vue/max-len */
    /*
      🤔 Potential improvements:
        Use user-friendly GUI sudo prompt for running the script.
      📝 Options:
        `open -a Terminal.app 'path'`
          ✅  Visible terminal window
          ❌  Terminal-based (not GUI) sudo prompt.
          ❌  Terminal app requires many privileges to execute the script, this prompts user
              to grant privileges to the Terminal app.
        `osascript -e 'do shell script "'/tmp/test.sh'" with administrator privileges'`
          ✅  Script as root
          ✅  GUI sudo prompt.
          ❌  Script execution in the background without a visible terminal.
        `osascript -e 'do shell script "open -a 'Terminal.app' '/tmp/test.sh'" with administrator privileges'`
          ❌  Script as user, not root
          ✅  GUI sudo prompt.
          ✅  Visible terminal window
        `osascript -e 'do shell script "/System/Applications/Utilities/Terminal.app/Contents/MacOS/Terminal '/tmp/test.sh'" with administrator privileges'`
          ✅  Script as root
          ✅  GUI sudo prompt.
          ✅  Visible terminal window
        Useful resources about `do shell script .. with administrator privileges`:
          - Change "osascript wants to make changes" prompt: https://web.archive.org/web/20240109191128/https://apple.stackexchange.com/questions/283353/how-to-rename-osascript-in-the-administrator-privileges-dialog
          - More about `do shell script`: https://web.archive.org/web/20100906222226/http://developer.apple.com/mac/library/technotes/tn2002/tn2065.html
    */
    /* eslint-enable vue/max-len */
    await runCommand(command, context);
  },
} as const;

async function runCommand(command: string, context: TerminalExecutionContext): Promise<void> {
  context.logger.info(`Executing command:\n${command}`);
  await context.commandOps.exec(command);
  context.logger.info('Executed command successfully.');
}

function posixShellPathArgumentEscape(pathArgument: string): string {
  /*
    - Wraps the path in single quotes, which is a standard practice in POSIX shells
      (like bash and zsh) found on macOS/Linux to ensure that characters like spaces, '*', and
      '?' are treated as literals, not as special characters.
    - Escapes any single quotes within the path itself. This allows paths containing single
      quotes to be correctly interpreted in POSIX-compliant systems, such as Linux and macOS.
  */
  return `'${pathArgument.replaceAll('\'', '\'\\\'\'')}'`;
}

function cmdShellPathArgumentEscape(pathArgument: string): string {
  // - Encloses the path in double quotes, which is necessary for Windows command line (cmd.exe)
  //   to correctly handle paths containing spaces.
  // - Paths in Windows cannot include double quotes `"` themselves, so these are not escaped.
  return `"${pathArgument}"`;
}
