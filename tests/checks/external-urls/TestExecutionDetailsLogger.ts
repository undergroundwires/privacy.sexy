import { indentText } from '@tests/shared/Text';

export class TestExecutionDetailsLogger {
  public logTestSectionStartDelimiter(): void {
    this.logSectionDelimiterLine();
  }

  public logTestSectionEndDelimiter(): void {
    this.logSectionDelimiterLine();
  }

  public logLabeledInformation(
    label: string,
    detailedInformation: string,
  ): void {
    console.log([
      `${label}:`,
      indentText(detailedInformation),
    ].join('\n'));
  }

  private logSectionDelimiterLine(): void {
    const horizontalLine = '─'.repeat(40);
    console.log(horizontalLine);
  }
}
