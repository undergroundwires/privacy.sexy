import type { FunctionData, ScriptData, CallInstruction } from '@/application/collections/';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import { validateCode, type CodeValidator } from '@/application/Parser/Executable/Script/Validation/CodeValidator';
import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import { createScriptCode, type ScriptCodeFactory } from '@/domain/Executables/Script/Code/ScriptCodeFactory';
import { filterEmptyStrings } from '@/application/Common/Text/FilterEmptyStrings';
import type { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { CodeValidationRule } from '@/application/Parser/Executable/Script/Validation/CodeValidationRule';
import { FunctionCallSequenceCompiler } from './Function/Call/Compiler/FunctionCallSequenceCompiler';
import { parseFunctionCalls } from './Function/Call/FunctionCallsParser';
import { parseSharedFunctions, type SharedFunctionsParser } from './Function/SharedFunctionsParser';
import type { CompiledCode } from './Function/Call/Compiler/CompiledCode';
import type { ScriptCompiler } from './ScriptCompiler';
import type { ISharedFunctionCollection } from './Function/ISharedFunctionCollection';
import type { FunctionCallCompiler } from './Function/Call/Compiler/FunctionCallCompiler';

export interface ScriptCompilerInitParameters {
  readonly categoryContext: CategoryCollectionDataContext;
  readonly utilities?: ScriptCompilerUtilities;
}

export interface ScriptCompilerFactory {
  (parameters: ScriptCompilerInitParameters): ScriptCompiler;
}

export const createScriptCompiler: ScriptCompilerFactory = (
  parameters,
) => {
  return new FunctionCallScriptCompiler(
    parameters.categoryContext,
    parameters.utilities ?? DefaultUtilities,
  );
};

interface ScriptCompilerUtilities {
  readonly sharedFunctionsParser: SharedFunctionsParser;
  readonly callCompiler: FunctionCallCompiler;
  readonly codeValidator: CodeValidator;
  readonly wrapError: ErrorWithContextWrapper;
  readonly scriptCodeFactory: ScriptCodeFactory;
}

const DefaultUtilities: ScriptCompilerUtilities = {
  sharedFunctionsParser: parseSharedFunctions,
  callCompiler: FunctionCallSequenceCompiler.instance,
  codeValidator: validateCode,
  wrapError: wrapErrorWithAdditionalContext,
  scriptCodeFactory: createScriptCode,
};

interface CategoryCollectionDataContext {
  readonly functions: readonly FunctionData[];
  readonly language: ScriptingLanguage;
}

class FunctionCallScriptCompiler implements ScriptCompiler {
  private readonly functions: ISharedFunctionCollection;

  private readonly language: ScriptingLanguage;

  constructor(
    categoryContext: CategoryCollectionDataContext,
    private readonly utilities: ScriptCompilerUtilities = DefaultUtilities,
  ) {
    this.functions = this.utilities.sharedFunctionsParser(
      categoryContext.functions,
      categoryContext.language,
    );
    this.language = categoryContext.language;
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
      validateCompiledCode(
        compiledCode,
        this.language,
        this.utilities.codeValidator,
      );
      return this.utilities.scriptCodeFactory(
        compiledCode.code,
        compiledCode.revertCode,
      );
    } catch (error) {
      throw this.utilities.wrapError(error, `Failed to compile script: ${script.name}`);
    }
  }
}

function validateCompiledCode(
  compiledCode: CompiledCode,
  language: ScriptingLanguage,
  validate: CodeValidator,
): void {
  filterEmptyStrings([compiledCode.code, compiledCode.revertCode])
    .forEach(
      (code) => validate(
        code,
        language,
        [
          CodeValidationRule.NoEmptyLines,
          CodeValidationRule.NoTooLongLines,
          // Allow duplicated lines to enable calling same function multiple times
        ],
      ),
    );
}

function hasCall(data: ScriptData): data is ScriptData & CallInstruction {
  return (data as CallInstruction).call !== undefined;
}
