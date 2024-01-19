import type { FunctionData, ScriptData, CallInstruction } from '@/application/collections/';
import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCode } from '@/domain/ScriptCode';
import { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import { CodeValidator } from '@/application/Parser/Script/Validation/CodeValidator';
import { NoEmptyLines } from '@/application/Parser/Script/Validation/Rules/NoEmptyLines';
import { ICodeValidator } from '@/application/Parser/Script/Validation/ICodeValidator';
import { IScriptCompiler } from './IScriptCompiler';
import { ISharedFunctionCollection } from './Function/ISharedFunctionCollection';
import { FunctionCallSequenceCompiler } from './Function/Call/Compiler/FunctionCallSequenceCompiler';
import { FunctionCallCompiler } from './Function/Call/Compiler/FunctionCallCompiler';
import { ISharedFunctionsParser } from './Function/ISharedFunctionsParser';
import { SharedFunctionsParser } from './Function/SharedFunctionsParser';
import { parseFunctionCalls } from './Function/Call/FunctionCallParser';
import { CompiledCode } from './Function/Call/Compiler/CompiledCode';

export class ScriptCompiler implements IScriptCompiler {
  private readonly functions: ISharedFunctionCollection;

  constructor(
    functions: readonly FunctionData[],
    syntax: ILanguageSyntax,
    sharedFunctionsParser: ISharedFunctionsParser = SharedFunctionsParser.instance,
    private readonly callCompiler: FunctionCallCompiler = FunctionCallSequenceCompiler.instance,
    private readonly codeValidator: ICodeValidator = CodeValidator.instance,
  ) {
    this.functions = sharedFunctionsParser.parseFunctions(functions, syntax);
  }

  public canCompile(script: ScriptData): boolean {
    return hasCall(script);
  }

  public compile(script: ScriptData): IScriptCode {
    try {
      if (!hasCall(script)) {
        throw new Error('Script does include any calls.');
      }
      const calls = parseFunctionCalls(script.call);
      const compiledCode = this.callCompiler.compileFunctionCalls(calls, this.functions);
      validateCompiledCode(compiledCode, this.codeValidator);
      return new ScriptCode(
        compiledCode.code,
        compiledCode.revertCode,
      );
    } catch (error) {
      throw Error(`Script "${script.name}" ${error.message}`);
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
