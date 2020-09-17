import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCode } from '@/domain/ScriptCode';
import { YamlScript, YamlFunction, FunctionCall, ScriptFunctionCall, FunctionCallParameters } from 'js-yaml-loader!./application.yaml';
import { IScriptCompiler } from './IScriptCompiler';

interface ICompiledCode {
    readonly code: string;
    readonly revertCode: string;
}

export class ScriptCompiler implements IScriptCompiler {
    constructor(private readonly functions: readonly YamlFunction[]) {
        ensureValidFunctions(functions);
    }
    public canCompile(script: YamlScript): boolean {
        if (!script.call) {
            return false;
        }
        return true;
    }
    public compile(script: YamlScript): IScriptCode {
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

    private getFunctionByName(name: string): YamlFunction {
        const func = this.functions.find((f) => f.name === name);
        if (!func) {
            throw new Error(`called function is not defined "${name}"`);
        }
        return func;
    }

    private ensureCompilable(call: ScriptFunctionCall) {
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

function ensureNoDuplicatesInFunctionNames(functions: readonly YamlFunction[]) {
    const duplicateFunctionNames = getDuplicates(functions
        .map((func) => func.name.toLowerCase()));
    if (duplicateFunctionNames.length) {
        throw new Error(`duplicate function name: ${printList(duplicateFunctionNames)}`);
    }
}

function ensureNoDuplicatesInParameterNames(functions: readonly YamlFunction[]) {
    const functionsWithParameters = functions
        .filter((func) => func.parameters && func.parameters.length > 0);
    for (const func of functionsWithParameters) {
        const duplicateParameterNames = getDuplicates(func.parameters);
        if (duplicateParameterNames.length) {
            throw new Error(`"${func.name}": duplicate parameter name: ${printList(duplicateParameterNames)}`);
        }
    }
}

function ensureNoDuplicateCode(functions: readonly YamlFunction[]) {
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

function ensureValidFunctions(functions: readonly YamlFunction[]) {
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

function compileCode(func: YamlFunction, parameters: FunctionCallParameters): ICompiledCode {
    return {
        code: compileExpressions(func.code, parameters),
        revertCode: compileExpressions(func.revertCode, parameters),
    };
}

function compileExpressions(code: string, parameters: FunctionCallParameters): string {
    let intermediateCode = compileToIL(code);
    intermediateCode = substituteParameters(intermediateCode, parameters);
    ensureNoExpressionLeft(intermediateCode);
    return intermediateCode;
}

function substituteParameters(intermediateCode: string, parameters: FunctionCallParameters): string {
    const parameterNames = getUniqueParameterNamesFromIL(intermediateCode);
    if (parameterNames.length && !parameters) {
        throw new Error(`no parameters defined, expected: ${printList(parameterNames)}`);
    }
    for (const parameterName of parameterNames) {
        const parameterValue = parameters[parameterName];
        intermediateCode = substituteParameter(intermediateCode, parameterName, parameterValue);
    }
    return intermediateCode;
}

function ensureValidCall(call: FunctionCall, scriptName: string) {
    if (!call) {
        throw new Error(`undefined function call in script "${scriptName}"`);
    }
    if (!call.function) {
        throw new Error(`empty function name called in script "${scriptName}"`);
    }
}

function getCallSequence(call: ScriptFunctionCall): FunctionCall[] {
    if (call instanceof Array) {
        return call as FunctionCall[];
    }
    return [ call as FunctionCall ];
}

function getDistinctValues(values: readonly string[]): string[] {
    return values.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
}

// Trim each expression and put them inside "{{exp|}}" e.g. "{{ $hello }}" becomes "{{exp|$hello}}"
function compileToIL(code: string) {
    return code.replace(/\{\{([\s]*[^;\s\{]+[\s]*)\}\}/g, (_, match) => {
        return `\{\{exp|${match.trim()}\}\}`;
    });
}

// Parses all distinct usages of {{exp|$parameterName}}
function getUniqueParameterNamesFromIL(ilCode: string) {
    const allSubstitutions = ilCode.matchAll(/\{\{exp\|\$([^;\s\{]+[\s]*)\}\}/g);
    const allParameters = Array.from(allSubstitutions, (match) => match[1]);
    const uniqueParameterNames = getDistinctValues(allParameters);
    return uniqueParameterNames;
}

// substitutes {{exp|$parameterName}} to value of the parameter
function substituteParameter(ilCode: string, parameterName: string, parameterValue: string) {
    if (!parameterValue) {
        throw Error(`parameter value is not provided for "${parameterName}" in function call`);
    }
    const pattern = `{{exp|$${parameterName}}}`;
    return ilCode.split(pattern).join(parameterValue); // as .replaceAll() is not yet supported by TS
}

// finds all "{{exp|..}} left"
function ensureNoExpressionLeft(ilCode: string) {
    const allSubstitutions = ilCode.matchAll(/\{\{exp\|(.*?)\}\}/g);
    const allMatches = Array.from(allSubstitutions, (match) => match[1]);
    const uniqueExpressions = getDistinctValues(allMatches);
    if (uniqueExpressions.length > 0) {
        throw new Error(`unknown expression: ${printList(uniqueExpressions)}`);
    }
}
