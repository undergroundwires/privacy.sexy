import { ScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/ScriptingLanguageFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { BatchBuilder } from './Languages/BatchBuilder';
import { ShellBuilder } from './Languages/ShellBuilder';
import type { ICodeBuilder } from './ICodeBuilder';
import type { ICodeBuilderFactory } from './ICodeBuilderFactory';

export class CodeBuilderFactory
  extends ScriptingLanguageFactory<ICodeBuilder>
  implements ICodeBuilderFactory {
  constructor() {
    super();
    this.registerGetter(ScriptingLanguage.shellscript, () => new ShellBuilder());
    this.registerGetter(ScriptingLanguage.batchfile, () => new BatchBuilder());
  }
}
