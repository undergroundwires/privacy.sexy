import { FunctionData, InstructionHolder } from 'js-yaml-loader!@/*';
import { createFunctionWithInlineCode, createCallerFunction } from './SharedFunction';
import { SharedFunctionCollection } from './SharedFunctionCollection';
import { ISharedFunctionCollection } from './ISharedFunctionCollection';
import { ISharedFunctionsParser } from './ISharedFunctionsParser';
import { FunctionParameter } from './Parameter/FunctionParameter';
import { FunctionParameterCollection } from './Parameter/FunctionParameterCollection';
import { IReadOnlyFunctionParameterCollection } from './Parameter/IFunctionParameterCollection';
import { ISharedFunction } from './ISharedFunction';
import { parseFunctionCalls } from './Call/FunctionCallParser';

export class SharedFunctionsParser implements ISharedFunctionsParser {
  public static readonly instance: ISharedFunctionsParser = new SharedFunctionsParser();

  public parseFunctions(
    functions: readonly FunctionData[],
  ): ISharedFunctionCollection {
    const collection = new SharedFunctionCollection();
    if (!functions || !functions.length) {
      return collection;
    }
    ensureValidFunctions(functions);
    for (const func of functions) {
      const sharedFunction = parseFunction(func);
      collection.addFunction(sharedFunction);
    }
    return collection;
  }
}

function parseFunction(data: FunctionData): ISharedFunction {
  const { name } = data;
  const parameters = parseParameters(data);
  if (hasCode(data)) {
    return createFunctionWithInlineCode(name, parameters, data.code, data.revertCode);
  }
  // Has call
  const calls = parseFunctionCalls(data.call);
  return createCallerFunction(name, parameters, calls);
}

function parseParameters(data: FunctionData): IReadOnlyFunctionParameterCollection {
  const parameters = new FunctionParameterCollection();
  if (!data.parameters) {
    return parameters;
  }
  for (const parameterData of data.parameters) {
    const isOptional = parameterData.optional || false;
    try {
      const parameter = new FunctionParameter(parameterData.name, isOptional);
      parameters.addParameter(parameter);
    } catch (err) {
      throw new Error(`"${data.name}": ${err.message}`);
    }
  }
  return parameters;
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
  ensureNoDuplicateCode(functions);
  ensureEitherCallOrCodeIsDefined(functions);
  ensureExpectedParametersType(functions);
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

function ensureExpectedParametersType(functions: readonly FunctionData[]) {
  const unexpectedFunctions = functions
    .filter((func) => func.parameters && !isArrayOfObjects(func.parameters));
  if (unexpectedFunctions.length) {
    const errorMessage = `parameters must be an array of objects in function(s) ${printNames(unexpectedFunctions)}`;
    throw new Error(errorMessage);
  }
}

function isArrayOfObjects(value: unknown): boolean {
  return Array.isArray(value)
    && value.every((item) => typeof item === 'object');
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
    throw new Error('some functions are undefined');
  }
}

function ensureNoDuplicateCode(functions: readonly FunctionData[]) {
  const duplicateCodes = getDuplicates(functions
    .map((func) => func.code)
    .filter((code) => code));
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
