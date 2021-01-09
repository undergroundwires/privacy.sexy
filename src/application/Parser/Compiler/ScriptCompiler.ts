import { generateIlCode, IILCode } from './ILCode';
import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCode } from '@/domain/ScriptCode';
import { ScriptData, FunctionData, FunctionCallData, ScriptFunctionCallData, FunctionCallParametersData } from 'js-yaml-loader!@/*';
import { IScriptCompiler } from './IScriptCompiler';

interface ICompiledCode {
    readonly code: string;
    readonly revertCode: string;
}

export class ScriptCompiler implements IScriptCompiler {
    constructor(private readonly functions: readonly FunctionData[]) {
        ensureValidFunctions(functions);
    }
    public canCompile(script: ScriptData): boolean {
        if (!script.call) {
            return false;
        }
        return true;
    }
    public compile(script: ScriptData): IScriptCode {
        this.ensureCompilable(script.call);
        const compiledCodes = new Array<ICompiledCode>();
        const calls = getCallSequence(script.call);
        calls.forEach((currentCall, currentCallIndex) => {
            ensureValidCall(currentCall, script.name);
            const commonFunction = this.getFunctionByName(currentCall.function);
            let functionCode = compileCode(commonFunction, currentCall.parameters);
            if (currentCallIndex !== calls.length - 1) {
                functionCode = appendLine(functionCode);
            }
            compiledCodes.push(functionCode);
        });
        const scriptCode = merge(compiledCodes);
        return new ScriptCode(script.name, scriptCode.code, scriptCode.revertCode);
    }

    private getFunctionByName(name: string): FunctionData {
        const func = this.functions.find((f) => f.name === name);
        if (!func) {
            throw new Error(`called function is not defined "${name}"`);
        }
        return func;
    }

    private ensureCompilable(call: ScriptFunctionCallData) {
        if (!this.functions || this.functions.length === 0) {
            throw new Error('cannot compile without shared functions');
        }
        if (typeof call !== 'object') {
            throw new Error('called function(s) must be an object');
        }
    }
}

function getDuplicates(texts: readonly string[]): string[] {
    return texts.filter((item, index) => texts.indexOf(item) !== index);
}

function printList(list: readonly string[]): string {
    return `"${list.join('","')}"`;
}

function ensureNoDuplicatesInFunctionNames(functions: readonly FunctionData[]) {
    const duplicateFunctionNames = getDuplicates(functions
        .map((func) => func.name.toLowerCase()));
    if (duplicateFunctionNames.length) {
        throw new Error(`duplicate function name: ${printList(duplicateFunctionNames)}`);
    }
}

function ensureNoDuplicatesInParameterNames(functions: readonly FunctionData[]) {
    const functionsWithParameters = functions
        .filter((func) => func.parameters && func.parameters.length > 0);
    for (const func of functionsWithParameters) {
        const duplicateParameterNames = getDuplicates(func.parameters);
        if (duplicateParameterNames.length) {
            throw new Error(`"${func.name}": duplicate parameter name: ${printList(duplicateParameterNames)}`);
        }
    }
}

function ensureNoDuplicateCode(functions: readonly FunctionData[]) {
    const duplicateCodes = getDuplicates(functions.map((func) => func.code));
    if (duplicateCodes.length > 0) {
        throw new Error(`duplicate "code" in functions: ${printList(duplicateCodes)}`);
    }
    const duplicateRevertCodes = getDuplicates(functions
        .filter((func) => func.revertCode)
        .map((func) => func.revertCode));
    if (duplicateRevertCodes.length > 0) {
        throw new Error(`duplicate "revertCode" in functions: ${printList(duplicateRevertCodes)}`);
    }
}

function ensureValidFunctions(functions: readonly FunctionData[]) {
    if (!functions) {
        return;
    }
    ensureNoDuplicatesInFunctionNames(functions);
    ensureNoDuplicatesInParameterNames(functions);
    ensureNoDuplicateCode(functions);
}

function appendLine(code: ICompiledCode): ICompiledCode {
    const appendLineIfNotEmpty = (str: string) => str ? `${str}\n` : str;
    return {
        code: appendLineIfNotEmpty(code.code),
        revertCode: appendLineIfNotEmpty(code.revertCode),
    };
}

function merge(codes: readonly ICompiledCode[]): ICompiledCode {
    return {
        code: codes.map((code) => code.code).join(''),
        revertCode: codes.map((code) => code.revertCode).join(''),
    };
}

function compileCode(func: FunctionData, parameters: FunctionCallParametersData): ICompiledCode {
    return {
        code: compileExpressions(func.code, parameters),
        revertCode: compileExpressions(func.revertCode, parameters),
    };
}

function compileExpressions(code: string, parameters: FunctionCallParametersData): string {
    let intermediateCode = generateIlCode(code);
    intermediateCode = substituteParameters(intermediateCode, parameters);
    return intermediateCode.compile();
}

function substituteParameters(intermediateCode: IILCode, parameters: FunctionCallParametersData): IILCode {
    const parameterNames = intermediateCode.getUniqueParameterNames();
    if (parameterNames.length && !parameters) {
        throw new Error(`no parameters defined, expected: ${printList(parameterNames)}`);
    }
    for (const parameterName of parameterNames) {
        const parameterValue = parameters[parameterName];
        if (!parameterValue) {
            throw Error(`parameter value is not provided for "${parameterName}" in function call`);
        }
        intermediateCode = intermediateCode.substituteParameter(parameterName, parameterValue);
    }
    return intermediateCode;
}

function ensureValidCall(call: FunctionCallData, scriptName: string) {
    if (!call) {
        throw new Error(`undefined function call in script "${scriptName}"`);
    }
    if (!call.function) {
        throw new Error(`empty function name called in script "${scriptName}"`);
    }
}

function getCallSequence(call: ScriptFunctionCallData): FunctionCallData[] {
    if (call instanceof Array) {
        return call as FunctionCallData[];
    }
    return [ call as FunctionCallData ];
}
