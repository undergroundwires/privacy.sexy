import { IExpressionEvaluationContext, ExpressionEvaluationContext } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionEvaluationContext';
import { IReadOnlyFunctionCallArgumentCollection } from '../Function/Call/Argument/IFunctionCallArgumentCollection';
import { IExpressionsCompiler } from './IExpressionsCompiler';
import { IExpression } from './Expression/IExpression';
import { IExpressionParser } from './Parser/IExpressionParser';
import { CompositeExpressionParser } from './Parser/CompositeExpressionParser';

export class ExpressionsCompiler implements IExpressionsCompiler {
  public constructor(
    private readonly extractor: IExpressionParser = new CompositeExpressionParser(),
  ) { }

  public compileExpressions(
    code: string,
    args: IReadOnlyFunctionCallArgumentCollection,
  ): string {
    if (!code) {
      return '';
    }
    const context = new ExpressionEvaluationContext(args);
    const compiledCode = compileRecursively(code, context, this.extractor);
    return compiledCode;
  }
}

function compileRecursively(
  code: string,
  context: IExpressionEvaluationContext,
  extractor: IExpressionParser,
): string {
  /*
    Instead of compiling code at once and returning we compile expressions from the code.
    And recompile expressions from resulting code recursively.
    This allows using expressions inside expressions blocks. E.g.:
    ```
      {{ with $condition }}
        echo '{{ $text }}'
      {{ end }}
    ```
    Without recursing parameter substitution for '{{ $text }}' is skipped once the outer
    {{ with $condition }} is rendered.
    A more optimized alternative to recursion would be to a parse an expression tree
    instead of linear expression lists.
  */
  if (!code) {
    return code;
  }
  const expressions = extractor.findExpressions(code);
  if (expressions.length === 0) {
    return code;
  }
  const compiledCode = compileExpressions(expressions, code, context);
  return compileRecursively(compiledCode, context, extractor);
}

function compileExpressions(
  expressions: readonly IExpression[],
  code: string,
  context: IExpressionEvaluationContext,
) {
  ensureValidExpressions(expressions, code, context);
  let compiledCode = '';
  const outerExpressions = expressions.filter(
    (expression) => expressions
      .filter((otherExpression) => otherExpression !== expression)
      .every((otherExpression) => !expression.position.isInInsideOf(otherExpression.position)),
  );
  /*
    This logic will only compile outer expressions if there were nested expressions.
    So the output of this compilation may result in new uncompiled expressions.
  */
  const sortedExpressions = outerExpressions
    .slice() // copy the array to not mutate the parameter
    .sort((a, b) => b.position.start - a.position.start);
  let index = 0;
  while (index !== code.length) {
    const nextExpression = sortedExpressions.pop();
    if (nextExpression) {
      compiledCode += code.substring(index, nextExpression.position.start);
      const expressionCode = nextExpression.evaluate(context);
      compiledCode += expressionCode;
      index = nextExpression.position.end;
    } else {
      compiledCode += code.substring(index, code.length);
      break;
    }
  }
  return compiledCode;
}

function extractRequiredParameterNames(
  expressions: readonly IExpression[],
): string[] {
  return expressions
    .map((e) => e.parameters.all
      .filter((p) => !p.isOptional)
      .map((p) => p.name))
    .filter(Boolean) // Remove empty or undefined
    .flat()
    .filter((name, index, array) => array.indexOf(name) === index); // Remove duplicates
}

function printList(list: readonly string[]): string {
  return `"${list.join('", "')}"`;
}

function ensureValidExpressions(
  expressions: readonly IExpression[],
  code: string,
  context: IExpressionEvaluationContext,
) {
  ensureParamsUsedInCodeHasArgsProvided(expressions, context.args);
  ensureExpressionsDoesNotExtendCodeLength(expressions, code);
  ensureNoExpressionsAtSamePosition(expressions);
  ensureNoInvalidIntersections(expressions);
}

function ensureExpressionsDoesNotExtendCodeLength(
  expressions: readonly IExpression[],
  code: string,
) {
  const expectedMax = code.length;
  const expressionsOutOfRange = expressions
    .filter((expression) => expression.position.end > expectedMax);
  if (expressionsOutOfRange.length > 0) {
    throw new Error(`Expressions out of range:\n${JSON.stringify(expressionsOutOfRange)}`);
  }
}

function ensureNoExpressionsAtSamePosition(expressions: readonly IExpression[]) {
  const instructionsAtSamePosition = expressions.filter(
    (expression) => expressions
      .filter((other) => expression.position.isSame(other.position)).length > 1,
  );
  if (instructionsAtSamePosition.length > 0) {
    throw new Error(`Instructions at same position:\n${JSON.stringify(instructionsAtSamePosition)}`);
  }
}

function ensureParamsUsedInCodeHasArgsProvided(
  expressions: readonly IExpression[],
  providedArgs: IReadOnlyFunctionCallArgumentCollection,
): void {
  const usedParameterNames = extractRequiredParameterNames(expressions);
  if (!usedParameterNames.length) {
    return;
  }
  const notProvidedParameters = usedParameterNames
    .filter((parameterName) => !providedArgs.hasArgument(parameterName));
  if (notProvidedParameters.length) {
    throw new Error(`parameter value(s) not provided for: ${printList(notProvidedParameters)} but used in code`);
  }
}

function ensureNoInvalidIntersections(expressions: readonly IExpression[]) {
  const intersectingInstructions = expressions.filter(
    (expression) => expressions
      .filter((other) => expression.position.isIntersecting(other.position))
      .filter((other) => !expression.position.isSame(other.position))
      .filter((other) => !expression.position.isInInsideOf(other.position))
      .filter((other) => !other.position.isInInsideOf(expression.position))
      .length > 0,
  );
  if (intersectingInstructions.length > 0) {
    throw new Error(`Instructions intersecting unexpectedly:\n${JSON.stringify(intersectingInstructions)}`);
  }
}
