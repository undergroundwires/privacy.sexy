import { ICodeBuilder } from './ICodeBuilder';

const NewLine = '\n';
const TotalFunctionSeparatorChars = 58;

export abstract class CodeBuilder implements ICodeBuilder {
  private readonly lines = new Array<string>();

  // Returns current line starting from 0 (no lines), or 1 (have single line)
  public get currentLine(): number {
    return this.lines.length;
  }

  public appendLine(code?: string): CodeBuilder {
    if (!code) {
      this.lines.push('');
      return this;
    }
    const lines = code.match(/[^\r\n]+/g);
    for (const line of lines) {
      this.lines.push(line);
    }
    return this;
  }

  public appendTrailingHyphensCommentLine(
    totalRepeatHyphens: number = TotalFunctionSeparatorChars,
  ): CodeBuilder {
    return this.appendCommentLine('-'.repeat(totalRepeatHyphens));
  }

  public appendCommentLine(commentLine?: string): CodeBuilder {
    this.lines.push(`${this.getCommentDelimiter()} ${commentLine}`);
    return this;
  }

  public appendFunction(name: string, code: string): CodeBuilder {
    if (!name) { throw new Error('name cannot be empty or null'); }
    if (!code) { throw new Error('code cannot be empty or null'); }
    return this
      .appendCommentLineWithHyphensAround(name)
      .appendLine(this.writeStandardOut(`--- ${name}`))
      .appendLine(code)
      .appendTrailingHyphensCommentLine();
  }

  public appendCommentLineWithHyphensAround(
    sectionName: string,
    totalRepeatHyphens: number = TotalFunctionSeparatorChars,
  ): CodeBuilder {
    if (!sectionName) { throw new Error('sectionName cannot be empty or null'); }
    if (sectionName.length >= totalRepeatHyphens) {
      return this.appendCommentLine(sectionName);
    }
    const firstHyphens = '-'.repeat(Math.floor((totalRepeatHyphens - sectionName.length) / 2));
    const secondHyphens = '-'.repeat(Math.ceil((totalRepeatHyphens - sectionName.length) / 2));
    return this
      .appendTrailingHyphensCommentLine()
      .appendCommentLine(firstHyphens + sectionName + secondHyphens)
      .appendTrailingHyphensCommentLine(TotalFunctionSeparatorChars);
  }

  public toString(): string {
    return this.lines.join(NewLine);
  }

  protected abstract getCommentDelimiter(): string;

  protected abstract writeStandardOut(text: string): string;
}
