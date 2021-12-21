import { IExpressionsCompiler } from './IExpressionsCompiler';
import { IExpression } from './Expression/IExpression';
import { IExpressionParser } from './Parser/IExpressionParser';
import { CompositeExpressionParser } from './Parser/CompositeExpressionParser';
import { IReadOnlyFunctionCallArgumentCollection } from '../Function/Call/Argument/IFunctionCallArgumentCollection';
import { ExpressionEvaluationContext } from './Expression/ExpressionEvaluationContext';
import { IExpressionEvaluationContext } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionEvaluationContext';

export class ExpressionsCompiler implements IExpressionsCompiler {
    public constructor(
        private readonly extractor: IExpressionParser = new CompositeExpressionParser()) { }
    public compileExpressions(
        code: string | undefined,
        args: IReadOnlyFunctionCallArgumentCollection): string {
        if (!args) {
            throw new Error('undefined args, send empty collection instead');
        }
        if (!code) {
            return code;
        }
        const expressions = this.extractor.findExpressions(code);
        ensureParamsUsedInCodeHasArgsProvided(expressions, args);
        const context = new ExpressionEvaluationContext(args);
        const compiledCode = compileExpressions(expressions, code, context);
        return compiledCode;
    }
}

function compileExpressions(
    expressions: readonly IExpression[],
    code: string,
    context: IExpressionEvaluationContext) {
    let compiledCode = '';
    const sortedExpressions = expressions
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
    expressions: readonly IExpression[]): string[] {
    const usedParameterNames = expressions
        .map((e) => e.parameters.all
            .filter((p) => !p.isOptional)
            .map((p) => p.name))
        .filter((p) => p)
        .flat();
    const uniqueParameterNames = Array.from(new Set(usedParameterNames));
    return uniqueParameterNames;
}

function ensureParamsUsedInCodeHasArgsProvided(
    expressions: readonly IExpression[],
    providedArgs: IReadOnlyFunctionCallArgumentCollection): void {
    const usedParameterNames = extractRequiredParameterNames(expressions);
    if (!usedParameterNames?.length) {
        return;
    }
    const notProvidedParameters = usedParameterNames
        .filter((parameterName) => !providedArgs.hasArgument(parameterName));
    if (notProvidedParameters.length) {
        throw new Error(`parameter value(s) not provided for: ${printList(notProvidedParameters)} but used in code`);
    }
}

function printList(list: readonly string[]): string {
    return `"${list.join('", "')}"`;
}
