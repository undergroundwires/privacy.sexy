import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import { Expression, type ExpressionEvaluator } from '../../Expression/Expression';
import { createPositionFromRegexFullMatch, type ExpressionPositionFactory } from '../../Expression/ExpressionPositionFactory';
import { createFunctionParameterCollection, type FunctionParameterCollectionFactory } from '../../../Function/Parameter/FunctionParameterCollectionFactory';
import type { IExpressionParser } from '../IExpressionParser';
import type { IExpression } from '../../Expression/IExpression';
import type { IFunctionParameter } from '../../../Function/Parameter/IFunctionParameter';
import type { IFunctionParameterCollection, IReadOnlyFunctionParameterCollection } from '../../../Function/Parameter/IFunctionParameterCollection';

export interface RegexParserUtilities {
  readonly wrapError: ErrorWithContextWrapper;
  readonly createPosition: ExpressionPositionFactory;
  readonly createExpression: ExpressionFactory;
  readonly createParameterCollection: FunctionParameterCollectionFactory;
}

export abstract class RegexParser implements IExpressionParser {
  protected abstract readonly regex: RegExp;

  public constructor(
    private readonly utilities: RegexParserUtilities = DefaultRegexParserUtilities,
  ) {

  }

  public findExpressions(code: string): IExpression[] {
    return Array.from(this.findRegexExpressions(code));
  }

  protected abstract buildExpression(match: RegExpMatchArray): PrimitiveExpression;

  private* findRegexExpressions(code: string): Iterable<IExpression> {
    if (!code) {
      throw new Error(
        this.buildErrorMessageWithContext({ errorMessage: 'missing code', code: 'EMPTY' }),
      );
    }
    const createErrorContext = (message: string): ErrorContext => ({ code, errorMessage: message });
    const matches = this.doOrRethrow(
      () => code.matchAll(this.regex),
      createErrorContext('Failed to match regex.'),
    );
    for (const match of matches) {
      const primitiveExpression = this.doOrRethrow(
        () => this.buildExpression(match),
        createErrorContext('Failed to build expression.'),
      );
      const position = this.doOrRethrow(
        () => this.utilities.createPosition(match),
        createErrorContext('Failed to create position.'),
      );
      const parameters = this.doOrRethrow(
        () => createParameters(
          primitiveExpression,
          this.utilities.createParameterCollection(),
        ),
        createErrorContext('Failed to create parameters.'),
      );
      const expression = this.doOrRethrow(
        () => this.utilities.createExpression({
          position,
          evaluator: primitiveExpression.evaluator,
          parameters,
        }),
        createErrorContext('Failed to create expression.'),
      );
      yield expression;
    }
  }

  private doOrRethrow<T>(
    action: () => T,
    context: ErrorContext,
  ): T {
    try {
      return action();
    } catch (error) {
      throw this.utilities.wrapError(
        error,
        this.buildErrorMessageWithContext(context),
      );
    }
  }

  private buildErrorMessageWithContext(context: ErrorContext): string {
    return [
      context.errorMessage,
      `Class name: ${this.constructor.name}`,
      `Regex pattern used: ${this.regex}`,
      `Code: ${context.code}`,
    ].join('\n');
  }
}

interface ErrorContext {
  readonly errorMessage: string,
  readonly code: string,
}

function createParameters(
  expression: PrimitiveExpression,
  parameterCollection: IFunctionParameterCollection,
): IReadOnlyFunctionParameterCollection {
  return (expression.parameters || [])
    .reduce((parameters, parameter) => {
      parameters.addParameter(parameter);
      return parameters;
    }, parameterCollection);
}

export interface PrimitiveExpression {
  readonly evaluator: ExpressionEvaluator;
  readonly parameters?: readonly IFunctionParameter[];
}

export interface ExpressionFactory {
  (
    ...args: ConstructorParameters<typeof Expression>
  ): IExpression;
}

const DefaultRegexParserUtilities: RegexParserUtilities = {
  wrapError: wrapErrorWithAdditionalContext,
  createPosition: createPositionFromRegexFullMatch,
  createExpression: (...args) => new Expression(...args),
  createParameterCollection: createFunctionParameterCollection,
};
