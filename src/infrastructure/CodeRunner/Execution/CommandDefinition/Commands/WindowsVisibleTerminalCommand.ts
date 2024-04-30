import { CmdShellArgumentEscaper } from './ShellArgument/CmdShellArgumentEscaper';
import type { ShellArgumentEscaper } from './ShellArgument/ShellArgumentEscaper';
import type { CommandDefinition } from '../CommandDefinition';

export class WindowsVisibleTerminalCommand implements CommandDefinition {
  constructor(
    private readonly escaper: ShellArgumentEscaper = new CmdShellArgumentEscaper(),
  ) { }

  public buildShellCommand(filePath: string): string {
    const command = [
      'PowerShell',
      'Start-Process',
      '-Verb RunAs', // Run as administrator with GUI sudo prompt
      `-FilePath ${this.escaper.escapePathArgument(filePath)}`,
    ].join(' ');
    return command;
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
  }

  public isExecutionTerminatedExternally(): boolean {
    return false;
  }

  public isExecutablePermissionsRequiredOnFile(): boolean {
    /*
      In Windows, whether a file can be executed is determined by its file extension
      (.exe, .bat, .cmd, etc.) rather than executable permissions set on the file.
    */
    return false;
  }
}
