import type { FunctionData } from '@/application/collections/';
import type { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { createScriptCompiler, type ScriptCompilerFactory } from './Script/Compiler/ScriptCompilerFactory';
import type { ScriptCompiler } from './Script/Compiler/ScriptCompiler';

export interface CategoryCollectionContext {
  readonly compiler: ScriptCompiler;
  readonly language: ScriptingLanguage;
}

export interface CategoryCollectionContextFactory {
  (
    functionsData: ReadonlyArray<FunctionData> | undefined,
    language: ScriptingLanguage,
    compilerFactory?: ScriptCompilerFactory,
  ): CategoryCollectionContext;
}

export const createCategoryCollectionContext: CategoryCollectionContextFactory = (
  functionsData: ReadonlyArray<FunctionData> | undefined,
  language: ScriptingLanguage,
  compilerFactory: ScriptCompilerFactory = createScriptCompiler,
) => {
  return {
    compiler: compilerFactory({
      categoryContext: {
        functions: functionsData ?? [],
        language,
      },
    }),
    language,
  };
};
