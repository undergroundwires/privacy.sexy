import type {
  FunctionData, CodeInstruction, CodeFunctionData, CallFunctionData,
  CallInstruction, ParameterDefinitionData,
} from '@/application/collections/';
import type { ILanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ILanguageSyntax';
import { CodeValidator } from '@/application/Parser/Executable/Script/Validation/CodeValidator';
import { NoEmptyLines } from '@/application/Parser/Executable/Script/Validation/Rules/NoEmptyLines';
import { NoDuplicatedLines } from '@/application/Parser/Executable/Script/Validation/Rules/NoDuplicatedLines';
import type { ICodeValidator } from '@/application/Parser/Executable/Script/Validation/ICodeValidator';
import { isArray, isNullOrUndefined, isPlainObject } from '@/TypeHelpers';
import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import { filterEmptyStrings } from '@/application/Common/Text/FilterEmptyStrings';
import { createFunctionWithInlineCode, createCallerFunction } from './SharedFunction';
import { SharedFunctionCollection } from './SharedFunctionCollection';
import { parseFunctionCalls, type FunctionCallsParser } from './Call/FunctionCallsParser';
import { createFunctionParameterCollection, type FunctionParameterCollectionFactory } from './Parameter/FunctionParameterCollectionFactory';
import { parseFunctionParameter, type FunctionParameterParser } from './Parameter/FunctionParameterParser';
import type { FunctionParameter } from './Parameter/FunctionParameter';
import type { ISharedFunctionCollection } from './ISharedFunctionCollection';
import type { IReadOnlyFunctionParameterCollection } from './Parameter/IFunctionParameterCollection';
import type { ISharedFunction } from './ISharedFunction';

export interface SharedFunctionsParser {
  (
    functions: readonly FunctionData[],
    syntax: ILanguageSyntax,
    utilities?: SharedFunctionsParsingUtilities,
  ): ISharedFunctionCollection;
}

export const parseSharedFunctions: SharedFunctionsParser = (
  functions: readonly FunctionData[],
  syntax: ILanguageSyntax,
  utilities = DefaultUtilities,
) => {
  const collection = new SharedFunctionCollection();
  if (!functions.length) {
    return collection;
  }
  ensureValidFunctions(functions);
  return functions
    .map((func) => parseFunction(func, syntax, utilities))
    .reduce((acc, func) => {
      acc.addFunction(func);
      return acc;
    }, collection);
};

const DefaultUtilities: SharedFunctionsParsingUtilities = {
  wrapError: wrapErrorWithAdditionalContext,
  parseParameter: parseFunctionParameter,
  codeValidator: CodeValidator.instance,
  createParameterCollection: createFunctionParameterCollection,
  parseFunctionCalls,
};

interface SharedFunctionsParsingUtilities {
  readonly wrapError: ErrorWithContextWrapper;
  readonly parseParameter: FunctionParameterParser;
  readonly codeValidator: ICodeValidator;
  readonly createParameterCollection: FunctionParameterCollectionFactory;
  readonly parseFunctionCalls: FunctionCallsParser;
}

function parseFunction(
  data: FunctionData,
  syntax: ILanguageSyntax,
  utilities: SharedFunctionsParsingUtilities,
): ISharedFunction {
  const { name } = data;
  const parameters = parseParameters(data, utilities);
  if (hasCode(data)) {
    validateCode(data, syntax, utilities.codeValidator);
    return createFunctionWithInlineCode(name, parameters, data.code, data.revertCode);
  }
  // Has call
  const calls = utilities.parseFunctionCalls(data.call);
  return createCallerFunction(name, parameters, calls);
}

function validateCode(
  data: CodeFunctionData,
  syntax: ILanguageSyntax,
  validator: ICodeValidator,
): void {
  filterEmptyStrings([data.code, data.revertCode])
    .forEach(
      (code) => validator.throwIfInvalid(
        code,
        [new NoEmptyLines(), new NoDuplicatedLines(syntax)],
      ),
    );
}

function parseParameters(
  data: FunctionData,
  utilities: SharedFunctionsParsingUtilities,
): IReadOnlyFunctionParameterCollection {
  return (data.parameters || [])
    .map((parameter) => parseParameterWithContextualError(
      data.name,
      parameter,
      utilities,
    ))
    .reduce((parameters, parameter) => {
      parameters.addParameter(parameter);
      return parameters;
    }, utilities.createParameterCollection());
}

function parseParameterWithContextualError(
  functionName: string,
  parameterData: ParameterDefinitionData,
  utilities: SharedFunctionsParsingUtilities,
): FunctionParameter {
  try {
    return utilities.parseParameter(parameterData);
  } catch (err) {
    throw utilities.wrapError(
      err,
      `Failed to create parameter: ${parameterData.name} for function "${functionName}"`,
    );
  }
}

function hasCode(data: FunctionData): data is CodeFunctionData {
  return (data as CodeInstruction).code !== undefined;
}

function hasCall(data: FunctionData): data is CallFunctionData {
  return (data as CallInstruction).call !== undefined;
}

function ensureValidFunctions(functions: readonly FunctionData[]) {
  ensureNoUnnamedFunctions(functions);
  ensureNoDuplicatesInFunctionNames(functions);
  ensureEitherCallOrCodeIsDefined(functions);
  ensureNoDuplicateCode(functions);
  ensureExpectedParametersType(functions);
}

function printList(list: readonly string[]): string {
  return `"${list.join('","')}"`;
}

function ensureNoUnnamedFunctions(functions: readonly FunctionData[]) {
  const functionsWithoutNames = functions.filter(
    (func) => !func.name || func.name.trim().length === 0,
  );
  if (functionsWithoutNames.length) {
    const invalidFunctions = functionsWithoutNames.map((f) => JSON.stringify(f));
    throw new Error(`Some function(s) have no names:\n${invalidFunctions.join('\n')}`);
  }
}

function ensureEitherCallOrCodeIsDefined(holders: readonly FunctionData[]) {
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
  const hasValidParameters = (
    func: FunctionData,
  ) => isNullOrUndefined(func.parameters) || isArrayOfObjects(func.parameters);
  const unexpectedFunctions = functions
    .filter((func) => !hasValidParameters(func));
  if (unexpectedFunctions.length) {
    const errorMessage = `parameters must be an array of objects in function(s) ${printNames(unexpectedFunctions)}`;
    throw new Error(errorMessage);
  }
}

function isArrayOfObjects(value: unknown): boolean {
  return isArray(value) && value.every((item) => isPlainObject(item));
}

function printNames(holders: readonly FunctionData[]) {
  return printList(holders.map((holder) => holder.name));
}

function ensureNoDuplicatesInFunctionNames(functions: readonly FunctionData[]) {
  const duplicateFunctionNames = getDuplicates(functions
    .map((func) => func.name.toLowerCase()));
  if (duplicateFunctionNames.length) {
    throw new Error(`duplicate function name: ${printList(duplicateFunctionNames)}`);
  }
}

function ensureNoDuplicateCode(functions: readonly FunctionData[]) {
  const callFunctions = functions
    .filter((func) => hasCode(func))
    .map((func) => func as CodeFunctionData);
  const duplicateCodes = getDuplicates(callFunctions
    .map((func) => func.code)
    .filter((code) => code));
  if (duplicateCodes.length > 0) {
    throw new Error(`duplicate "code" in functions: ${printList(duplicateCodes)}`);
  }
  const duplicateRevertCodes = getDuplicates(filterEmptyStrings(
    callFunctions.map((func) => func.revertCode),
  ));
  if (duplicateRevertCodes.length > 0) {
    throw new Error(`duplicate "revertCode" in functions: ${printList(duplicateRevertCodes)}`);
  }
}

function getDuplicates(texts: readonly string[]): string[] {
  return texts.filter((item, index) => texts.indexOf(item) !== index);
}
