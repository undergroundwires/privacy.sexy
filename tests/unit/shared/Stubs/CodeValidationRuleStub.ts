import type { ICodeLine } from '@/application/Parser/Executable/Script/Validation/ICodeLine';
import type { ICodeValidationRule, IInvalidCodeLine } from '@/application/Parser/Executable/Script/Validation/ICodeValidationRule';

export class CodeValidationRuleStub implements ICodeValidationRule {
  public readonly receivedLines = new Array<readonly ICodeLine[]>();

  private returnValue: IInvalidCodeLine[] = [];

  public withReturnValue(lines: readonly IInvalidCodeLine[]) {
    this.returnValue = [...lines];
    return this;
  }

  public analyze(lines: readonly ICodeLine[]): IInvalidCodeLine[] {
    this.receivedLines.push(...[lines]);
    return this.returnValue;
  }
}
