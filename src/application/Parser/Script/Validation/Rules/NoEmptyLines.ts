import type { ICodeValidationRule, IInvalidCodeLine } from '../ICodeValidationRule';
import type { ICodeLine } from '../ICodeLine';

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
