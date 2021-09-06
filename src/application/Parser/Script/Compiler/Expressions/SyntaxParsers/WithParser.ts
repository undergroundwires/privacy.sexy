import { RegexParser, IPrimitiveExpression } from '../Parser/RegexParser';
import { FunctionParameter } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameter';

export class WithParser extends RegexParser {
    protected readonly regex = /{{\s*with\s+\$([^}| ]+)\s*}}\s*([^)]+?)\s*{{\s*end\s*}}/g;
    protected buildExpression(match: RegExpMatchArray): IPrimitiveExpression {
        const parameterName = match[1];
        const innerText = match[2];
        return {
            parameters: [ new FunctionParameter(parameterName, true) ],
            evaluator: (args) => {
                const argumentValue = args.hasArgument(parameterName) ?
                    args.getArgument(parameterName).argumentValue
                    : undefined;
                if (!argumentValue) {
                    return '';
                }
                const substitutionRegex = /{{\s*.\s*}}/g;
                const newText = innerText.replace(substitutionRegex, argumentValue);
                return newText;
            },
        };
    }
}
