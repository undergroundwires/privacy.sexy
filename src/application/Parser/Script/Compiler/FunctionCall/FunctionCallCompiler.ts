import { FunctionCallData, ScriptFunctionCallData } from 'js-yaml-loader!@/*';
import { ICompiledCode } from './ICompiledCode';
import { ISharedFunctionCollection } from '../Function/ISharedFunctionCollection';
import { IFunctionCallCompiler } from './IFunctionCallCompiler';
import { IExpressionsCompiler } from '../Expressions/IExpressionsCompiler';
import { ExpressionsCompiler } from '../Expressions/ExpressionsCompiler';
import { ISharedFunction } from '../Function/ISharedFunction';
import { IFunctionCall } from './IFunctionCall';
import { FunctionCall } from './FunctionCall';
import { FunctionCallArgument } from './Argument/FunctionCallArgument';
import { IReadOnlyFunctionCallArgumentCollection } from './Argument/IFunctionCallArgumentCollection';
import { FunctionCallArgumentCollection } from './Argument/FunctionCallArgumentCollection';

export class FunctionCallCompiler implements IFunctionCallCompiler {
    public static readonly instance: IFunctionCallCompiler = new FunctionCallCompiler();

    protected constructor(
        private readonly expressionsCompiler: IExpressionsCompiler = new ExpressionsCompiler()) {

    }

    public compileCall(
        call: ScriptFunctionCallData,
        functions: ISharedFunctionCollection): ICompiledCode {
        if (!functions) { throw new Error('undefined functions'); }
        if (!call) { throw new Error('undefined call'); }
        const compiledFunctions = new Array<ICompiledFunction>();
        const callSequence = getCallSequence(call);
        for (const currentCall of callSequence) {
            const functionCall = parseFunctionCall(currentCall);
            const sharedFunction = functions.getFunctionByName(functionCall.functionName);
            ensureThatCallArgumentsExistInParameterDefinition(sharedFunction, functionCall.args);
            const compiledFunction = compileCode(sharedFunction, functionCall.args, this.expressionsCompiler);
            compiledFunctions.push(compiledFunction);
        }
        return {
            code: merge(compiledFunctions.map((f) => f.code)),
            revertCode: merge(compiledFunctions.map((f) => f.revertCode)),
        };
    }
}

function merge(codeParts: readonly string[]): string {
    return codeParts
        .filter((part) => part?.length > 0)
        .join('\n');
}

interface ICompiledFunction {
    readonly code: string;
    readonly revertCode: string;
}

function compileCode(
    func: ISharedFunction,
    args: IReadOnlyFunctionCallArgumentCollection,
    compiler: IExpressionsCompiler): ICompiledFunction {
    return {
        code: compiler.compileExpressions(func.code, args),
        revertCode: compiler.compileExpressions(func.revertCode, args),
    };
}

function getCallSequence(call: ScriptFunctionCallData): FunctionCallData[] {
    if (typeof call !== 'object') {
        throw new Error('called function(s) must be an object');
    }
    if (call instanceof Array) {
        return call as FunctionCallData[];
    }
    return [ call as FunctionCallData ];
}

function parseFunctionCall(call: FunctionCallData): IFunctionCall {
    if (!call) {
        throw new Error(`undefined function call`);
    }
    const args = new FunctionCallArgumentCollection();
    for (const parameterName of Object.keys(call.parameters || {})) {
        const arg = new FunctionCallArgument(parameterName, call.parameters[parameterName]);
        args.addArgument(arg);
    }
    return new FunctionCall(call.function, args);
}

function ensureThatCallArgumentsExistInParameterDefinition(
    func: ISharedFunction,
    args: IReadOnlyFunctionCallArgumentCollection): void {
    const callArgumentNames = args.getAllParameterNames();
    const functionParameterNames = func.parameters.all.map((param) => param.name) || [];
    if (!callArgumentNames.length && !functionParameterNames.length) {
        return;
    }
    const parametersOutsideFunction = callArgumentNames
        .filter((callParam) => !functionParameterNames.includes(callParam));
    if (parametersOutsideFunction.length) {
        throw new Error(
            `function "${func.name}" has unexpected parameter(s) provided:` +
            `"${parametersOutsideFunction.join('", "')}"`);
    }
}
