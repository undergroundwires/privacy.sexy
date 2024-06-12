import type { FunctionData, ScriptData, CallInstruction } from '@/application/collections/';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import type { ILanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ILanguageSyntax';
import { CodeValidator } from '@/application/Parser/Executable/Script/Validation/CodeValidator';
import { NoEmptyLines } from '@/application/Parser/Executable/Script/Validation/Rules/NoEmptyLines';
import type { ICodeValidator } from '@/application/Parser/Executable/Script/Validation/ICodeValidator';
import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Parser/ContextualError';
import { createScriptCode, type ScriptCodeFactory } from '@/domain/Executables/Script/Code/ScriptCodeFactory';
import { SharedFunctionsParser } from './Function/SharedFunctionsParser';
import { FunctionCallSequenceCompiler } from './Function/Call/Compiler/FunctionCallSequenceCompiler';
import { parseFunctionCalls } from './Function/Call/FunctionCallParser';
import type { CompiledCode } from './Function/Call/Compiler/CompiledCode';
import type { IScriptCompiler } from './IScriptCompiler';
import type { ISharedFunctionCollection } from './Function/ISharedFunctionCollection';
import type { FunctionCallCompiler } from './Function/Call/Compiler/FunctionCallCompiler';
import type { ISharedFunctionsParser } from './Function/ISharedFunctionsParser';

export class ScriptCompiler implements IScriptCompiler {
  private readonly functions: ISharedFunctionCollection;

  constructor(
    functions: readonly FunctionData[],
    syntax: ILanguageSyntax,
    sharedFunctionsParser: ISharedFunctionsParser = SharedFunctionsParser.instance,
    private readonly callCompiler: FunctionCallCompiler = FunctionCallSequenceCompiler.instance,
    private readonly codeValidator: ICodeValidator = CodeValidator.instance,
    private readonly wrapError: ErrorWithContextWrapper = wrapErrorWithAdditionalContext,
    private readonly scriptCodeFactory: ScriptCodeFactory = createScriptCode,
  ) {
    this.functions = sharedFunctionsParser.parseFunctions(functions, syntax);
  }

  public canCompile(script: ScriptData): boolean {
    return hasCall(script);
  }

  public compile(script: ScriptData): ScriptCode {
    try {
      if (!hasCall(script)) {
        throw new Error('Script does include any calls.');
      }
      const calls = parseFunctionCalls(script.call);
      const compiledCode = this.callCompiler.compileFunctionCalls(calls, this.functions);
      validateCompiledCode(compiledCode, this.codeValidator);
      return this.scriptCodeFactory(
        compiledCode.code,
        compiledCode.revertCode,
      );
    } catch (error) {
      throw this.wrapError(error, `Failed to compile script: ${script.name}`);
    }
  }
}

function validateCompiledCode(compiledCode: CompiledCode, validator: ICodeValidator): void {
  [compiledCode.code, compiledCode.revertCode]
    .filter((code): code is string => Boolean(code))
    .map((code) => code as string)
    .forEach(
      (code) => validator.throwIfInvalid(
        code,
        [new NoEmptyLines()],
      ),
    );
}

function hasCall(data: ScriptData): data is ScriptData & CallInstruction {
  return (data as CallInstruction).call !== undefined;
}
