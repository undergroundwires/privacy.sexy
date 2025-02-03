import type { ScriptMetadata } from '@/domain/ScriptMetadata/ScriptMetadata';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';

export class ScriptMetadataStub implements ScriptMetadata {
  public fileExtension = '.bat';

  public language = ScriptLanguage.batchfile;

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

  public withLanguage(language: ScriptLanguage): this {
    this.language = language;
    return this;
  }
}
