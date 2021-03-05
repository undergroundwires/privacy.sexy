import { FunctionCallData, FunctionCallParametersData, FunctionData, ScriptFunctionCallData } from 'js-yaml-loader!*';
import { ICompiledCode } from './ICompiledCode';
import { ISharedFunctionCollection } from '../Function/ISharedFunctionCollection';
import { IFunctionCallCompiler } from './IFunctionCallCompiler';
import { IExpressionsCompiler } from '../Expressions/IExpressionsCompiler';
import { ExpressionsCompiler } from '../Expressions/ExpressionsCompiler';

export class FunctionCallCompiler implements IFunctionCallCompiler {
    public static readonly instance: IFunctionCallCompiler = new FunctionCallCompiler();
    protected constructor(
        private readonly expressionsCompiler: IExpressionsCompiler = new ExpressionsCompiler()) { }
    public compileCall(
        call: ScriptFunctionCallData,
        functions: ISharedFunctionCollection): ICompiledCode {
        if (!functions) { throw new Error('undefined functions'); }
        if (!call) { throw new Error('undefined call'); }
        const compiledCodes = new Array<ICompiledCode>();
        const calls = getCallSequence(call);
        calls.forEach((currentCall, currentCallIndex) => {
            ensureValidCall(currentCall);
            const commonFunction = functions.getFunctionByName(currentCall.function);
            ensureExpectedParameters(commonFunction, currentCall);
            let functionCode = compileCode(commonFunction, currentCall.parameters, this.expressionsCompiler);
            if (currentCallIndex !== calls.length - 1) {
                functionCode = appendLine(functionCode);
            }
            compiledCodes.push(functionCode);
        });
        const compiledCode = merge(compiledCodes);
        return compiledCode;
    }
}

function ensureExpectedParameters(func: FunctionData, call: FunctionCallData) {
    const actual = Object.keys(call.parameters || {});
    const expected = func.parameters || [];
    if (!actual.length && !expected.length) {
        return;
    }
    const unexpectedParameters = actual.filter((callParam) => !expected.includes(callParam));
    if (unexpectedParameters.length) {
        throw new Error(
            `function "${func.name}" has unexpected parameter(s) provided: "${unexpectedParameters.join('", "')}"`);
    }
}

function merge(codes: readonly ICompiledCode[]): ICompiledCode {
    return {
        code: codes.map((code) => code.code).join(''),
        revertCode: codes.map((code) => code.revertCode).join(''),
    };
}

function compileCode(
    func: FunctionData,
    parameters: FunctionCallParametersData,
    compiler: IExpressionsCompiler): ICompiledCode {
    return {
        code: compiler.compileExpressions(func.code, parameters),
        revertCode: compiler.compileExpressions(func.revertCode, parameters),
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

function ensureValidCall(call: FunctionCallData) {
    if (!call) {
        throw new Error(`undefined function call`);
    }
    if (!call.function) {
        throw new Error(`empty function name called`);
    }
}

function appendLine(code: ICompiledCode): ICompiledCode {
    const appendLineIfNotEmpty = (str: string) => str ? `${str}\n` : str;
    return {
        code: appendLineIfNotEmpty(code.code),
        revertCode: appendLineIfNotEmpty(code.revertCode),
    };
}
