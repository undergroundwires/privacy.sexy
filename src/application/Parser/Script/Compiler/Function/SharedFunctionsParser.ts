import type { FunctionData, InstructionHolder } from '@/application/collections/';
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
    if (!syntax) { throw new Error('missing syntax'); }
    const collection = new SharedFunctionCollection();
    if (!functions || !functions.length) {
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
  data: FunctionData,
  syntax: ILanguageSyntax,
  validator: ICodeValidator,
): void {
  [data.code, data.revertCode].forEach(
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
