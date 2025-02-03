import type { FunctionData } from '@/application/collections/';
import type { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { createScriptCompiler, type ScriptCompilerFactory } from './Script/Compiler/ScriptCompilerFactory';
import type { ScriptCompiler } from './Script/Compiler/ScriptCompiler';

export interface CategoryCollectionContext {
  readonly compiler: ScriptCompiler;
  readonly language: ScriptLanguage;
}

export interface CategoryCollectionContextFactory {
  (
    functionsData: ReadonlyArray<FunctionData> | undefined,
    language: ScriptLanguage,
    compilerFactory?: ScriptCompilerFactory,
  ): CategoryCollectionContext;
}

export const createCategoryCollectionContext: CategoryCollectionContextFactory = (
  functionsData: ReadonlyArray<FunctionData> | undefined,
  language: ScriptLanguage,
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
