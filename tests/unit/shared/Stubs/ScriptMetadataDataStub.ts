import type { ScriptMetadataData } from '@/application/collections/';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';

export class ScriptMetadataDataStub implements ScriptMetadataData {
  public language = ScriptLanguage[ScriptLanguage.batchfile];

  public fileExtension = 'bat';

  public startCode = 'startCode';

  public endCode = 'endCode';

  public withLanguage(language: string): ScriptMetadataDataStub {
    this.language = language;
    return this;
  }

  public withStartCode(startCode: string): ScriptMetadataDataStub {
    this.startCode = startCode;
    return this;
  }

  public withEndCode(endCode: string): ScriptMetadataDataStub {
    this.endCode = endCode;
    return this;
  }

  public withExtension(extension: string): ScriptMetadataDataStub {
    this.fileExtension = extension;
    return this;
  }
}
