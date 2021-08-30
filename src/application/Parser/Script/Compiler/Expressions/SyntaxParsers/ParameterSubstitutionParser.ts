import { RegexParser, IPrimitiveExpression } from '../Parser/RegexParser';

export class ParameterSubstitutionParser extends RegexParser {
    protected readonly regex = /{{\s*\$([^}| ]+)\s*}}/g;
    protected buildExpression(match: RegExpMatchArray): IPrimitiveExpression {
        const parameterName = match[1];
        return {
            parameters: [ parameterName ],
            evaluator: (args) => args[parameterName],
        };
    }
}
