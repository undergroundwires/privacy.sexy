import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/ScriptingLanguageFactory';
import { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import { BatchFileSyntax } from './BatchFileSyntax';
import { ShellScriptSyntax } from './ShellScriptSyntax';
import { ISyntaxFactory } from './ISyntaxFactory';

export class SyntaxFactory
  extends ScriptingLanguageFactory<ILanguageSyntax>
  implements ISyntaxFactory {
  constructor() {
    super();
    this.registerGetter(ScriptingLanguage.batchfile, () => new BatchFileSyntax());
    this.registerGetter(ScriptingLanguage.shellscript, () => new ShellScriptSyntax());
  }
}
