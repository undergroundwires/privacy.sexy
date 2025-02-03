import { ScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/ScriptingLanguageFactory';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { BatchBuilder } from './Languages/BatchBuilder';
import { ShellBuilder } from './Languages/ShellBuilder';
import type { ICodeBuilder } from './ICodeBuilder';
import type { ICodeBuilderFactory } from './ICodeBuilderFactory';

export class CodeBuilderFactory
  extends ScriptingLanguageFactory<ICodeBuilder>
  implements ICodeBuilderFactory {
  constructor() {
    super();
    this.registerGetter(ScriptLanguage.shellscript, () => new ShellBuilder());
    this.registerGetter(ScriptLanguage.batchfile, () => new BatchBuilder());
  }
}
