import type { FunctionData } from '@/application/collections/';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { IScriptCompiler } from './Compiler/IScriptCompiler';
import { ScriptCompiler } from './Compiler/ScriptCompiler';
import { ICategoryCollectionParseContext } from './ICategoryCollectionParseContext';
import { SyntaxFactory } from './Validation/Syntax/SyntaxFactory';
import { ISyntaxFactory } from './Validation/Syntax/ISyntaxFactory';
import { ILanguageSyntax } from './Validation/Syntax/ILanguageSyntax';

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
