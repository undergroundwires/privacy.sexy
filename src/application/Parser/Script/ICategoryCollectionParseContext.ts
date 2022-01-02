import { ILanguageSyntax } from '@/domain/ScriptCode';
import { IScriptCompiler } from './Compiler/IScriptCompiler';

export interface ICategoryCollectionParseContext {
  readonly compiler: IScriptCompiler;
  readonly syntax: ILanguageSyntax;
}
