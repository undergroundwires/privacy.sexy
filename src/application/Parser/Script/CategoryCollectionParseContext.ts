import { FunctionData } from 'js-yaml-loader!@/*';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ILanguageSyntax } from '@/domain/ScriptCode';
import { IScriptCompiler } from './Compiler/IScriptCompiler';
import { ScriptCompiler } from './Compiler/ScriptCompiler';
import { ICategoryCollectionParseContext } from './ICategoryCollectionParseContext';
import { SyntaxFactory } from './Syntax/SyntaxFactory';
import { ISyntaxFactory } from './Syntax/ISyntaxFactory';

export class CategoryCollectionParseContext implements ICategoryCollectionParseContext {
  public readonly compiler: IScriptCompiler;

  public readonly syntax: ILanguageSyntax;

  constructor(
    functionsData: ReadonlyArray<FunctionData> | undefined,
    scripting: IScriptingDefinition,
    syntaxFactory: ISyntaxFactory = new SyntaxFactory(),
  ) {
    if (!scripting) { throw new Error('undefined scripting'); }
    this.syntax = syntaxFactory.create(scripting.language);
    this.compiler = new ScriptCompiler(functionsData, this.syntax);
  }
}
