import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import type { FunctionData } from '@/application/collections/';
import { ScriptCompiler } from './Script/Compiler/ScriptCompiler';
import { SyntaxFactory } from './Script/Validation/Syntax/SyntaxFactory';
import type { IScriptCompiler } from './Script/Compiler/IScriptCompiler';
import type { ILanguageSyntax } from './Script/Validation/Syntax/ILanguageSyntax';
import type { ISyntaxFactory } from './Script/Validation/Syntax/ISyntaxFactory';

export interface CategoryCollectionSpecificUtilities {
  readonly compiler: IScriptCompiler;
  readonly syntax: ILanguageSyntax;
}

export const createCollectionUtilities: CategoryCollectionSpecificUtilitiesFactory = (
  functionsData: ReadonlyArray<FunctionData> | undefined,
  scripting: IScriptingDefinition,
  syntaxFactory: ISyntaxFactory = new SyntaxFactory(),
) => {
  const syntax = syntaxFactory.create(scripting.language);
  return {
    compiler: new ScriptCompiler({
      functions: functionsData ?? [],
      syntax,
    }),
    syntax,
  };
};

export interface CategoryCollectionSpecificUtilitiesFactory {
  (
    functionsData: ReadonlyArray<FunctionData> | undefined,
    scripting: IScriptingDefinition,
    syntaxFactory?: ISyntaxFactory,
  ): CategoryCollectionSpecificUtilities;
}
