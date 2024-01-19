import { IExpression } from '@/application/Parser/Script/Compiler/Expressions/Expression/IExpression';
import { IExpressionParser } from '@/application/Parser/Script/Compiler/Expressions/Parser/IExpressionParser';

export class ExpressionParserStub implements IExpressionParser {
  public callHistory = new Array<string>();

  private results = new Map<string, readonly IExpression[]>();

  public withResult(code: string, result: readonly IExpression[]) {
    if (this.results.has(code)) {
      throw new Error(
        'Result for code is already registered.'
        + `\nCode: ${code}`
        + `\nResult: ${JSON.stringify(result)}`,
      );
    }
    this.results.set(code, result);
    return this;
  }

  public findExpressions(code: string): IExpression[] {
    this.callHistory.push(code);
    const foundResult = this.results.get(code);
    if (foundResult) {
      return [...foundResult];
    }
    return [];
  }
}
