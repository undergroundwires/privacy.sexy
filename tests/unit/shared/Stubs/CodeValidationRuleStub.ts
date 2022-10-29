import { ICodeLine } from '@/application/Parser/Script/Validation/ICodeLine';
import { ICodeValidationRule, IInvalidCodeLine } from '@/application/Parser/Script/Validation/ICodeValidationRule';

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
