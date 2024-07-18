import type { FunctionData, ScriptData, CallInstruction } from '@/application/collections/';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import type { ILanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ILanguageSyntax';
import { CodeValidator } from '@/application/Parser/Executable/Script/Validation/CodeValidator';
import { NoEmptyLines } from '@/application/Parser/Executable/Script/Validation/Rules/NoEmptyLines';
import type { ICodeValidator } from '@/application/Parser/Executable/Script/Validation/ICodeValidator';
import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import { createScriptCode, type ScriptCodeFactory } from '@/domain/Executables/Script/Code/ScriptCodeFactory';
import { filterEmptyStrings } from '@/application/Common/Text/FilterEmptyStrings';
import { FunctionCallSequenceCompiler } from './Function/Call/Compiler/FunctionCallSequenceCompiler';
import { parseFunctionCalls } from './Function/Call/FunctionCallsParser';
import { parseSharedFunctions, type SharedFunctionsParser } from './Function/SharedFunctionsParser';
import type { CompiledCode } from './Function/Call/Compiler/CompiledCode';
import type { IScriptCompiler } from './IScriptCompiler';
import type { ISharedFunctionCollection } from './Function/ISharedFunctionCollection';
import type { FunctionCallCompiler } from './Function/Call/Compiler/FunctionCallCompiler';

interface ScriptCompilerUtilities {
  readonly sharedFunctionsParser: SharedFunctionsParser;
  readonly callCompiler: FunctionCallCompiler;
  readonly codeValidator: ICodeValidator;
  readonly wrapError: ErrorWithContextWrapper;
  readonly scriptCodeFactory: ScriptCodeFactory;
}

const DefaultUtilities: ScriptCompilerUtilities = {
  sharedFunctionsParser: parseSharedFunctions,
  callCompiler: FunctionCallSequenceCompiler.instance,
  codeValidator: CodeValidator.instance,
  wrapError: wrapErrorWithAdditionalContext,
  scriptCodeFactory: createScriptCode,
};

interface CategoryCollectionDataContext {
  readonly functions: readonly FunctionData[];
  readonly syntax: ILanguageSyntax;
}

export class ScriptCompiler implements IScriptCompiler {
  private readonly functions: ISharedFunctionCollection;

  constructor(
    categoryContext: CategoryCollectionDataContext,
    private readonly utilities: ScriptCompilerUtilities = DefaultUtilities,
  ) {
    this.functions = this.utilities.sharedFunctionsParser(
      categoryContext.functions,
      categoryContext.syntax,
    );
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
      const compiledCode = this.utilities.callCompiler.compileFunctionCalls(calls, this.functions);
      validateCompiledCode(compiledCode, this.utilities.codeValidator);
      return this.utilities.scriptCodeFactory(
        compiledCode.code,
        compiledCode.revertCode,
      );
    } catch (error) {
      throw this.utilities.wrapError(error, `Failed to compile script: ${script.name}`);
    }
  }
}

function validateCompiledCode(compiledCode: CompiledCode, validator: ICodeValidator): void {
  filterEmptyStrings([compiledCode.code, compiledCode.revertCode])
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
