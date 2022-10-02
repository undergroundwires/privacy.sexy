import { FunctionParameter } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameter';
import { RegexParser, IPrimitiveExpression } from '../Parser/Regex/RegexParser';
import { ExpressionRegexBuilder } from '../Parser/Regex/ExpressionRegexBuilder';

export class WithParser extends RegexParser {
  protected readonly regex = new ExpressionRegexBuilder()
  // {{ with $parameterName }}
    .expectExpressionStart()
    .expectCharacters('with')
    .expectOneOrMoreWhitespaces()
    .expectCharacters('$')
    .matchUntilFirstWhitespace() // First match: parameter name
    .expectExpressionEnd()
  // ...
    .matchMultilineAnythingExceptSurroundingWhitespaces() // Second match: Scope text
  // {{ end }}
    .expectExpressionStart()
    .expectCharacters('end')
    .expectExpressionEnd()
    .buildRegExp();

  protected buildExpression(match: RegExpMatchArray): IPrimitiveExpression {
    const parameterName = match[1];
    const scopeText = match[2];
    return {
      parameters: [new FunctionParameter(parameterName, true)],
      evaluator: (context) => {
        const argumentValue = context.args.hasArgument(parameterName)
          ? context.args.getArgument(parameterName).argumentValue
          : undefined;
        if (!argumentValue) {
          return '';
        }
        return replaceEachScopeSubstitution(scopeText, (pipeline) => {
          if (!pipeline) {
            return argumentValue;
          }
          return context.pipelineCompiler.compile(argumentValue, pipeline);
        });
      },
    };
  }
}

const ScopeSubstitutionRegEx = new ExpressionRegexBuilder()
// {{ . | pipeName }}
  .expectExpressionStart()
  .expectCharacters('.')
  .matchPipeline() // First match: pipeline
  .expectExpressionEnd()
  .buildRegExp();

function replaceEachScopeSubstitution(scopeText: string, replacer: (pipeline: string) => string) {
  // Not using /{{\s*.\s*(?:(\|\s*[^{}]*?)\s*)?}}/g for not matching brackets,
  // but instead letting the pipeline compiler to fail on those.
  return scopeText.replaceAll(ScopeSubstitutionRegEx, (_$, match1) => {
    return replacer(match1);
  });
}
