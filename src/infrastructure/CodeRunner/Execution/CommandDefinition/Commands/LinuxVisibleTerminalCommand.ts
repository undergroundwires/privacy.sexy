import { PosixShellArgumentEscaper } from './ShellArgument/PosixShellArgumentEscaper';
import type { CommandDefinition } from '../CommandDefinition';
import type { ShellArgumentEscaper } from './ShellArgument/ShellArgumentEscaper';

export const LinuxTerminalEmulator = 'x-terminal-emulator';

export class LinuxVisibleTerminalCommand implements CommandDefinition {
  constructor(
    private readonly escaper: ShellArgumentEscaper = new PosixShellArgumentEscaper(),
  ) { }

  public buildShellCommand(filePath: string): string {
    return `${LinuxTerminalEmulator} -e ${this.escaper.escapePathArgument(filePath)}`;
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
  }

  public isExecutionTerminatedExternally(exitCode: number): boolean {
    return exitCode === 137;
    /*
      `x-terminal-emulator` may return exit code `137` under specific circumstances like when the
      user closes the terminal (observed with `gnome-terminal` on Pop!_OS). This exit code (128 +
      Unix signal 9) indicates the process was terminated by a SIGKILL signal, which can occur due
      to user action (cancelling the progress) or the system (e.g., due to memory shortages).

      Additional exit codes noted for future consideration (currently not handled as they have not
      been reproduced):

      - 130 (130 = 128 + Unix signal 2): Indicates the script was terminated by the user
        (Control-C), corresponding to a SIGINT signal.
      - 143 (128 + Unix signal 15): Indicates termination by a SIGTERM signal, suggesting a request
        to gracefully terminate the process.
    */
  }

  public isExecutablePermissionsRequiredOnFile(): boolean {
    /*
      On Linux, a script file without executable permissions cannot be run directly by its path
      without specifying a shell explicitly.
    */
    return true;
  }
}
