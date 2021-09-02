import { RegexParser, IPrimitiveExpression } from '../Parser/RegexParser';
import { FunctionParameter } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameter';

export class ParameterSubstitutionParser extends RegexParser {
    protected readonly regex = /{{\s*\$([^}| ]+)\s*}}/g;
    protected buildExpression(match: RegExpMatchArray): IPrimitiveExpression {
        const parameterName = match[1];
        return {
            parameters: [ new FunctionParameter(parameterName, false) ],
            evaluator: (args) => args.getArgument(parameterName).argumentValue,
        };
    }
}
