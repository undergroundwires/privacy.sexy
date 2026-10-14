import { CodeBuilder } from '@/application/Context/State/Code/Generation/CodeBuilder';

export class BatchBuilder extends CodeBuilder {
  protected getCommentDelimiter(): string {
    return '::';
  }

  protected writeStandardOut(text: string): string {
    if (!text) {
      return 'echo(';
    }
    return `echo ${escapeForEcho(text)}`;
  }

  protected getNewLineTerminator(): string {
    return '\r\n';
  }
}

function escapeForEcho(text: string): string {
  return text
    .replace(/[\^"&|<>()]/g, '^$&')
    .replace(/%/g, '%%');
}
