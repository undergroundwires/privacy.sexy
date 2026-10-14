import { CodeBuilder } from '@/application/Context/State/Code/Generation/CodeBuilder';

export class ShellBuilder extends CodeBuilder {
  protected getCommentDelimiter(): string {
    return '#';
  }

  protected writeStandardOut(text: string): string {
    return `printf '%s\\n' '${escapeForShellString(text)}'`;
  }

  protected getNewLineTerminator(): string {
    return '\n';
  }
}

function escapeForShellString(text: string): string {
  return text
    .replace(/'/g, '\'\\\'\'');
}
