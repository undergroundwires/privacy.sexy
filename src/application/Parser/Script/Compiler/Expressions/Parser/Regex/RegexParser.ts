import { Expression, type ExpressionEvaluator } from '../../Expression/Expression';
import { FunctionParameterCollection } from '../../../Function/Parameter/FunctionParameterCollection';
import { createPositionFromRegexFullMatch } from '../../Expression/ExpressionPositionFactory';
import type { IExpressionParser } from '../IExpressionParser';
import type { IExpression } from '../../Expression/IExpression';
import type { IFunctionParameter } from '../../../Function/Parameter/IFunctionParameter';

export abstract class RegexParser implements IExpressionParser {
  protected abstract readonly regex: RegExp;

  public findExpressions(code: string): IExpression[] {
    return Array.from(this.findRegexExpressions(code));
  }

  protected abstract buildExpression(match: RegExpMatchArray): IPrimitiveExpression;

  private* findRegexExpressions(code: string): Iterable<IExpression> {
    if (!code) {
      throw new Error('missing code');
    }
    const matches = code.matchAll(this.regex);
    for (const match of matches) {
      const primitiveExpression = this.buildExpression(match);
      const position = this.doOrRethrow(() => createPositionFromRegexFullMatch(match), 'invalid script position', code);
      const parameters = createParameters(primitiveExpression);
      const expression = new Expression(position, primitiveExpression.evaluator, parameters);
      yield expression;
    }
  }

  private doOrRethrow<T>(action: () => T, errorText: string, code: string): T {
    try {
      return action();
    } catch (error) {
      throw new Error(`[${this.constructor.name}] ${errorText}: ${error.message}\nRegex: ${this.regex}\nCode: ${code}`);
    }
  }
}

function createParameters(
  expression: IPrimitiveExpression,
): FunctionParameterCollection {
  return (expression.parameters || [])
    .reduce((parameters, parameter) => {
      parameters.addParameter(parameter);
      return parameters;
    }, new FunctionParameterCollection());
}

export interface IPrimitiveExpression {
  evaluator: ExpressionEvaluator;
  parameters?: readonly IFunctionParameter[];
}
