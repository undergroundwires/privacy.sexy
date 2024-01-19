import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';

export class ScriptingDefinitionStub implements IScriptingDefinition {
  public fileExtension = '.bat';

  public language = ScriptingLanguage.batchfile;

  public startCode = 'REM start code';

  public endCode = 'REM end code';

  public withStartCode(startCode: string): this {
    this.startCode = startCode;
    return this;
  }

  public withEndCode(endCode: string): this {
    this.endCode = endCode;
    return this;
  }

  public withLanguage(language: ScriptingLanguage): this {
    this.language = language;
    return this;
  }
}
