import { ICodeLine } from '../ICodeLine';
import { ICodeValidationRule, IInvalidCodeLine } from '../ICodeValidationRule';

export class NoEmptyLines implements ICodeValidationRule {
  public analyze(lines: readonly ICodeLine[]): IInvalidCodeLine[] {
    return lines
      .filter((line) => (line.text?.trim().length ?? 0) === 0)
      .map((line): IInvalidCodeLine => ({
        index: line.index,
        error: (() => {
          if (!line.text) {
            return 'Empty line';
          }
          const markedText = line.text
            .replaceAll(' ', '{whitespace}')
            .replaceAll('\t', '{tab}');
          return `Empty line: "${markedText}"`;
        })(),
      }));
  }
}
