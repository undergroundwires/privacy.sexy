import type { FunctionData } from '@/application/collections/';
import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ScriptCompiler } from './Compiler/ScriptCompiler';
import { SyntaxFactory } from './Validation/Syntax/SyntaxFactory';
import type { ILanguageSyntax } from './Validation/Syntax/ILanguageSyntax';
import type { IScriptCompiler } from './Compiler/IScriptCompiler';
import type { ICategoryCollectionParseContext } from './ICategoryCollectionParseContext';
import type { ISyntaxFactory } from './Validation/Syntax/ISyntaxFactory';

export class CategoryCollectionParseContext implements ICategoryCollectionParseContext {
  public readonly compiler: IScriptCompiler;

  public readonly syntax: ILanguageSyntax;

  constructor(
    functionsData: ReadonlyArray<FunctionData> | undefined,
    scripting: IScriptingDefinition,
    syntaxFactory: ISyntaxFactory = new SyntaxFactory(),
  ) {
    this.syntax = syntaxFactory.create(scripting.language);
    this.compiler = new ScriptCompiler(functionsData ?? [], this.syntax);
  }
}
