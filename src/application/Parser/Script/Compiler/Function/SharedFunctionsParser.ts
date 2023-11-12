import type {
  FunctionData, CodeInstruction, CodeFunctionData, CallFunctionData, CallInstruction,
} from '@/application/collections/';
import { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import { CodeValidator } from '@/application/Parser/Script/Validation/CodeValidator';
import { NoEmptyLines } from '@/application/Parser/Script/Validation/Rules/NoEmptyLines';
import { NoDuplicatedLines } from '@/application/Parser/Script/Validation/Rules/NoDuplicatedLines';
import { ICodeValidator } from '@/application/Parser/Script/Validation/ICodeValidator';
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

  constructor(private readonly codeValidator: ICodeValidator = CodeValidator.instance) { }

  public parseFunctions(
    functions: readonly FunctionData[],
    syntax: ILanguageSyntax,
  ): ISharedFunctionCollection {
    const collection = new SharedFunctionCollection();
    if (!functions.length) {
      return collection;
    }
    ensureValidFunctions(functions);
    return functions
      .map((func) => parseFunction(func, syntax, this.codeValidator))
      .reduce((acc, func) => {
        acc.addFunction(func);
        return acc;
      }, collection);
  }
}

function parseFunction(
  data: FunctionData,
  syntax: ILanguageSyntax,
  validator: ICodeValidator,
): ISharedFunction {
  const { name } = data;
  const parameters = parseParameters(data);
  if (hasCode(data)) {
    validateCode(data, syntax, validator);
    return createFunctionWithInlineCode(name, parameters, data.code, data.revertCode);
  }
  // Has call
  const calls = parseFunctionCalls(data.call);
  return createCallerFunction(name, parameters, calls);
}

function validateCode(
  data: CodeFunctionData,
  syntax: ILanguageSyntax,
  validator: ICodeValidator,
): void {
  [data.code, data.revertCode]
    .filter((code): code is string => Boolean(code))
    .forEach(
      (code) => validator.throwIfInvalid(
        code,
        [new NoEmptyLines(), new NoDuplicatedLines(syntax)],
      ),
    );
}

function parseParameters(data: FunctionData): IReadOnlyFunctionParameterCollection {
  return (data.parameters || [])
    .map((parameter) => {
      try {
        return new FunctionParameter(
          parameter.name,
          parameter.optional || false,
        );
      } catch (err) {
        throw new Error(`"${data.name}": ${err.message}`);
      }
    })
    .reduce((parameters, parameter) => {
      parameters.addParameter(parameter);
      return parameters;
    }, new FunctionParameterCollection());
}

function hasCode(data: FunctionData): data is CodeFunctionData {
  return (data as CodeInstruction).code !== undefined;
}

function hasCall(data: FunctionData): data is CallFunctionData {
  return (data as CallInstruction).call !== undefined;
}

function ensureValidFunctions(functions: readonly FunctionData[]) {
  ensureNoDuplicatesInFunctionNames(functions);
  ensureEitherCallOrCodeIsDefined(functions);
  ensureNoDuplicateCode(functions);
  ensureExpectedParametersType(functions);
}

function printList(list: readonly string[]): string {
  return `"${list.join('","')}"`;
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
  const duplicateRevertCodes = getDuplicates(callFunctions
    .map((func) => func.revertCode)
    .filter((code): code is string => Boolean(code)));
  if (duplicateRevertCodes.length > 0) {
    throw new Error(`duplicate "revertCode" in functions: ${printList(duplicateRevertCodes)}`);
  }
}

function getDuplicates(texts: readonly string[]): string[] {
  return texts.filter((item, index) => texts.indexOf(item) !== index);
}
