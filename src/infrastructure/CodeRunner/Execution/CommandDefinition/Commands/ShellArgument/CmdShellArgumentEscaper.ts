import type { ShellArgumentEscaper } from './ShellArgumentEscaper';

export class CmdShellArgumentEscaper implements ShellArgumentEscaper {
  public escapePathArgument(pathArgument: string): string {
    return cmdShellPathArgumentEscape(pathArgument);
  }
}

function cmdShellPathArgumentEscape(pathArgument: string): string {
  // - Encloses the path in double quotes, which is necessary for Windows command line (cmd.exe)
  //   to correctly handle paths containing spaces.
  // - Paths in Windows cannot include double quotes `"` themselves, so these are not escaped.
  return `"${pathArgument}"`;
}
