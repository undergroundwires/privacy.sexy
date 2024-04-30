import type { ShellArgumentEscaper } from './ShellArgumentEscaper';

export class PosixShellArgumentEscaper implements ShellArgumentEscaper {
  public escapePathArgument(pathArgument: string): string {
    return posixShellPathArgumentEscape(pathArgument);
  }
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
