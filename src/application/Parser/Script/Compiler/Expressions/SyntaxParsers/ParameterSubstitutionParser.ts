import { FunctionParameter } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameter';
import { RegexParser, type PrimitiveExpression } from '../Parser/Regex/RegexParser';
import { ExpressionRegexBuilder } from '../Parser/Regex/ExpressionRegexBuilder';

export class ParameterSubstitutionParser extends RegexParser {
  protected readonly regex = new ExpressionRegexBuilder()
    .expectExpressionStart()
    .expectCharacters('$')
    .captureUntilWhitespaceOrPipe() // First capture: Parameter name
    .expectOptionalWhitespaces()
    .captureOptionalPipeline() // Second capture: Pipeline
    .expectExpressionEnd()
    .buildRegExp();

  protected buildExpression(match: RegExpMatchArray): PrimitiveExpression {
    const parameterName = match[1];
    const pipeline = match[2];
    return {
      parameters: [new FunctionParameter(parameterName, false)],
      evaluator: (context) => {
        const { argumentValue } = context.args.getArgument(parameterName);
        if (!pipeline) {
          return argumentValue;
        }
        return context.pipelineCompiler.compile(argumentValue, pipeline);
      },
    };
  }
}
