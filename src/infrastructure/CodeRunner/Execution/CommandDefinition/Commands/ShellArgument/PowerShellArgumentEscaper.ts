import type { ShellArgumentEscaper } from './ShellArgumentEscaper';

export class PowerShellArgumentEscaper implements ShellArgumentEscaper {
  public escapePathArgument(pathArgument: string): string {
    return powerShellPathArgumentEscape(pathArgument);
  }
}

function powerShellPathArgumentEscape(pathArgument: string): string {
  // - Encloses the path in single quotes to handle spaces and most special characters.
  // - Single quotes are used in PowerShell to ensure the string is treated as a literal string.
  // - Paths in Windows can include single quotes ('), so any internal single quotes are escaped
  //   using double quotes.
  return `'${pathArgument.replace(/'/g, "''")}'`;
}
