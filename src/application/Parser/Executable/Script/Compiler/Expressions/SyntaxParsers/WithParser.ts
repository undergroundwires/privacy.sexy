// eslint-disable-next-line max-classes-per-file
import type { IExpressionParser } from '@/application/Parser/Executable/Script/Compiler/Expressions/Parser/IExpressionParser';
import { FunctionParameterCollection } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/FunctionParameterCollection';
import { FunctionParameter } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/FunctionParameter';
import { ExpressionPosition } from '../Expression/ExpressionPosition';
import { ExpressionRegexBuilder } from '../Parser/Regex/ExpressionRegexBuilder';
import { createPositionFromRegexFullMatch } from '../Expression/ExpressionPositionFactory';
import type { IExpression } from '../Expression/IExpression';

export class WithParser implements IExpressionParser {
  public findExpressions(code: string): IExpression[] {
    if (!code) {
      throw new Error('missing code');
    }
    return parseWithExpressions(code);
  }
}

enum WithStatementType {
  Start,
  End,
  ContextVariable,
}

type WithStatement = {
  readonly type: WithStatementType.Start;
  readonly parameterName: string;
  readonly position: ExpressionPosition;
} | {
  readonly type: WithStatementType.End;
  readonly position: ExpressionPosition;
} | {
  readonly type: WithStatementType.ContextVariable;
  readonly position: ExpressionPosition;
  readonly pipeline: string | undefined;
};

function parseAllWithExpressions(
  input: string,
): WithStatement[] {
  const expressions = new Array<WithStatement>();
  for (const match of input.matchAll(WithStatementStartRegEx)) {
    expressions.push({
      type: WithStatementType.Start,
      parameterName: match[1],
      position: createPositionFromRegexFullMatch(match),
    });
  }
  for (const match of input.matchAll(WithStatementEndRegEx)) {
    expressions.push({
      type: WithStatementType.End,
      position: createPositionFromRegexFullMatch(match),
    });
  }
  for (const match of input.matchAll(ContextVariableWithPipelineRegEx)) {
    expressions.push({
      type: WithStatementType.ContextVariable,
      position: createPositionFromRegexFullMatch(match),
      pipeline: match[1],
    });
  }
  return expressions;
}

class WithStatementBuilder {
  private readonly contextVariables = new Array<{
    readonly positionInScope: ExpressionPosition;
    readonly pipeline: string | undefined;
  }>();

  public addContextVariable(
    absolutePosition: ExpressionPosition,
    pipeline: string | undefined,
  ): void {
    const positionInScope = new ExpressionPosition(
      absolutePosition.start - this.startExpressionPosition.end,
      absolutePosition.end - this.startExpressionPosition.end,
    );
    this.contextVariables.push({
      positionInScope,
      pipeline,
    });
  }

  public buildExpression(endExpressionPosition: ExpressionPosition, input: string): IExpression {
    const parameters = new FunctionParameterCollection();
    parameters.addParameter(new FunctionParameter(this.parameterName, true));
    const position = new ExpressionPosition(
      this.startExpressionPosition.start,
      endExpressionPosition.end,
    );
    const scope = input.substring(this.startExpressionPosition.end, endExpressionPosition.start);
    return {
      parameters,
      position,
      evaluate: (context) => {
        const argumentValue = context.args.hasArgument(this.parameterName)
          ? context.args.getArgument(this.parameterName).argumentValue
          : undefined;
        if (!argumentValue) {
          return '';
        }
        const substitutedScope = this.substituteContextVariables(scope, (pipeline) => {
          if (!pipeline) {
            return argumentValue;
          }
          return context.pipelineCompiler.compile(argumentValue, pipeline);
        });
        return substitutedScope;
      },
    };
  }

  constructor(
    private readonly startExpressionPosition: ExpressionPosition,
    private readonly parameterName: string,
  ) {

  }

  private substituteContextVariables(
    scope: string,
    substituter: (pipeline?: string) => string,
  ): string {
    if (!this.contextVariables.length) {
      return scope;
    }
    let substitutedScope = '';
    let scopeSubstrIndex = 0;
    for (const contextVariable of this.contextVariables) {
      substitutedScope += scope.substring(scopeSubstrIndex, contextVariable.positionInScope.start);
      substitutedScope += substituter(contextVariable.pipeline);
      scopeSubstrIndex = contextVariable.positionInScope.end;
    }
    substitutedScope += scope.substring(scopeSubstrIndex, scope.length);
    return substitutedScope;
  }
}

function buildErrorContext(code: string, statements: readonly WithStatement[]): string {
  const formattedStatements = statements.map((s) => `- [${s.position.start}, ${s.position.end}] ${WithStatementType[s.type]}`).join('\n');
  return [
    'Code:', '---', code, '---',
    'nStatements:', '---', formattedStatements, '---',
  ].join('\n');
}

function parseWithExpressions(input: string): IExpression[] {
  const allStatements = parseAllWithExpressions(input);
  const sortedStatements = allStatements
    .slice()
    .sort((a, b) => b.position.start - a.position.start);
  const expressions = new Array<IExpression>();
  const builders = new Array<WithStatementBuilder>();
  const throwWithContext = (message: string): never => {
    throw new Error(`${message}\n${buildErrorContext(input, allStatements)}}`);
  };
  while (sortedStatements.length > 0) {
    const statement = sortedStatements.pop();
    if (!statement) {
      break;
    }
    switch (statement.type) { // eslint-disable-line default-case
      case WithStatementType.Start:
        builders.push(new WithStatementBuilder(
          statement.position,
          statement.parameterName,
        ));
        break;
      case WithStatementType.ContextVariable:
        if (builders.length === 0) {
          throwWithContext('Context variable before `with` statement.');
        }
        builders[builders.length - 1].addContextVariable(statement.position, statement.pipeline);
        break;
      case WithStatementType.End: {
        const builder = builders.pop();
        if (!builder) {
          throwWithContext('Redundant `end` statement, missing `with`?');
          break;
        }
        expressions.push(builder.buildExpression(statement.position, input));
        break;
      }
    }
  }
  if (builders.length > 0) {
    throwWithContext('Missing `end` statement, forgot `{{ end }}?');
  }
  return expressions;
}

const ContextVariableWithPipelineRegEx = new ExpressionRegexBuilder()
// {{ . | pipeName }}
  .expectExpressionStart()
  .expectCharacters('.')
  .expectOptionalWhitespaces()
  .captureOptionalPipeline() // First capture: pipeline
  .expectExpressionEnd()
  .buildRegExp();

const WithStatementStartRegEx = new ExpressionRegexBuilder()
  // {{ with $parameterName }}
  .expectExpressionStart()
  .expectCharacters('with')
  .expectOneOrMoreWhitespaces()
  .expectCharacters('$')
  .captureUntilWhitespaceOrPipe() // First capture: parameter name
  .expectExpressionEnd()
  .expectOptionalWhitespaces()
  .buildRegExp();

const WithStatementEndRegEx = new ExpressionRegexBuilder()
  // {{ end }}
  .expectOptionalWhitespaces()
  .expectExpressionStart()
  .expectCharacters('end')
  .expectOptionalWhitespaces()
  .expectExpressionEnd()
  .buildRegExp();
