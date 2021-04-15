import { FunctionData, InstructionHolder } from 'js-yaml-loader!@/*';
import { SharedFunction } from './SharedFunction';
import { SharedFunctionCollection } from './SharedFunctionCollection';
import { ISharedFunctionCollection } from './ISharedFunctionCollection';
import { IFunctionCompiler } from './IFunctionCompiler';
import { IFunctionCallCompiler } from '../FunctionCall/IFunctionCallCompiler';
import { FunctionCallCompiler } from '../FunctionCall/FunctionCallCompiler';

export class FunctionCompiler implements IFunctionCompiler {
    public static readonly instance: IFunctionCompiler = new FunctionCompiler();
    protected constructor(
        private readonly functionCallCompiler: IFunctionCallCompiler = FunctionCallCompiler.instance) {
     }
    public compileFunctions(functions: readonly FunctionData[]): ISharedFunctionCollection {
        const collection = new SharedFunctionCollection();
        if (!functions || !functions.length) {
            return collection;
        }
        ensureValidFunctions(functions);
        functions
            .filter((func) => hasCode(func))
            .forEach((func) => {
                const shared = new SharedFunction(func.name, func.parameters, func.code, func.revertCode);
                collection.addFunction(shared);
            });
        functions
            .filter((func) => hasCall(func))
            .forEach((func) => {
                const code = this.functionCallCompiler.compileCall(func.call, collection);
                const shared = new SharedFunction(func.name, func.parameters, code.code, code.revertCode);
                collection.addFunction(shared);
            });
        return collection;
    }
}

function hasCode(data: FunctionData): boolean {
    return Boolean(data.code);
}

function hasCall(data: FunctionData): boolean {
    return Boolean(data.call);
}


function ensureValidFunctions(functions: readonly FunctionData[]) {
    ensureNoUndefinedItem(functions);
    ensureNoDuplicatesInFunctionNames(functions);
    ensureNoDuplicatesInParameterNames(functions);
    ensureNoDuplicateCode(functions);
    ensureEitherCallOrCodeIsDefined(functions);
    ensureExpectedParameterNameTypes(functions);
}

function printList(list: readonly string[]): string {
    return `"${list.join('","')}"`;
}

function ensureEitherCallOrCodeIsDefined(holders: readonly InstructionHolder[]) {
    // Ensure functions do not define both call and code
    const withBothCallAndCode = holders.filter((holder) => hasCode(holder) && hasCall(holder));
    if (withBothCallAndCode.length) {
        throw new Error(`both "code" and "call" are defined in ${printNames(withBothCallAndCode)}`);
    }
    // Ensure functions have either code or call
    const hasEitherCodeOrCall = holders.filter((holder) => !hasCode(holder) && !hasCall(holder));
    if (hasEitherCodeOrCall.length) {
        throw new Error(`neither "code" or "call" is defined in ${printNames(hasEitherCodeOrCall)}`);
    }
}

function ensureExpectedParameterNameTypes(functions: readonly FunctionData[]) {
    const unexpectedFunctions = functions.filter((func) => func.parameters && !isArrayOfStrings(func.parameters));
    if (unexpectedFunctions.length) {
        throw new Error(`unexpected parameter name type in ${printNames(unexpectedFunctions)}`);
    }
    function isArrayOfStrings(value: any): boolean {
        return Array.isArray(value) && value.every((item) => typeof item === 'string');
     }
}

function printNames(holders: readonly InstructionHolder[]) {
    return printList(holders.map((holder) => holder.name));
}

function ensureNoDuplicatesInFunctionNames(functions: readonly FunctionData[]) {
    const duplicateFunctionNames = getDuplicates(functions
        .map((func) => func.name.toLowerCase()));
    if (duplicateFunctionNames.length) {
        throw new Error(`duplicate function name: ${printList(duplicateFunctionNames)}`);
    }
}
function ensureNoUndefinedItem(functions: readonly FunctionData[]) {
    if (functions.some((func) => !func)) {
        throw new Error(`some functions are undefined`);
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
    const duplicateCodes = getDuplicates(functions
        .map((func) => func.code)
        .filter((code) => code),
    );
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

function getDuplicates(texts: readonly string[]): string[] {
    return texts.filter((item, index) => texts.indexOf(item) !== index);
}
