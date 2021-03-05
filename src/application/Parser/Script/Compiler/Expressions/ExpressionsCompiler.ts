import { IExpressionsCompiler, ParameterValueDictionary } from './IExpressionsCompiler';
import { IExpression } from './Expression/IExpression';
import { IExpressionParser } from './Parser/IExpressionParser';
import { CompositeExpressionParser } from './Parser/CompositeExpressionParser';

export class ExpressionsCompiler implements IExpressionsCompiler {
    public constructor(private readonly extractor: IExpressionParser = new CompositeExpressionParser()) { }
    public compileExpressions(code: string, parameters?: ParameterValueDictionary): string {
        const expressions = this.extractor.findExpressions(code);
        const requiredParameterNames = expressions.map((e) => e.parameters).filter((p) => p).flat();
        const uniqueParameterNames = Array.from(new Set(requiredParameterNames));
        ensureRequiredArgsProvided(uniqueParameterNames, parameters);
        return compileExpressions(expressions, code, parameters);
    }
}

function compileExpressions(expressions: IExpression[], code: string, parameters?: ParameterValueDictionary) {
    let compiledCode = '';
    expressions = expressions
        .slice() // copy the array to not mutate the parameter
        .sort((a, b) => b.position.start - a.position.start);
    let index = 0;
    while (index !== code.length) {
        const nextExpression = expressions.pop();
        if (nextExpression) {
            compiledCode += code.substring(index, nextExpression.position.start);
            const expressionCode = nextExpression.evaluate(parameters);
            compiledCode += expressionCode;
            index = nextExpression.position.end;
        } else {
            compiledCode += code.substring(index, code.length);
            break;
        }
    }
    return compiledCode;
}

function ensureRequiredArgsProvided(parameters: readonly string[], args: ParameterValueDictionary) {
    parameters = parameters || [];
    args = args || {};
    if (!parameters.length) {
        return;
    }
    const notProvidedParameters = parameters.filter((parameter) => !Boolean(args[parameter]));
    if (notProvidedParameters.length) {
        throw new Error(`parameter value(s) not provided for: ${printList(notProvidedParameters)}`);
    }
}

function printList(list: readonly string[]): string {
    return `"${list.join('", "')}"`;
}
