import { ScriptingDefinitionData } from 'js-yaml-loader!@/*';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';

export class ScriptingDefinitionDataStub implements ScriptingDefinitionData {
    public language = ScriptingLanguage[ScriptingLanguage.batchfile];
    public fileExtension = 'bat';
    public startCode = 'startCode';
    public endCode = 'endCode';

    public withLanguage(language: string): ScriptingDefinitionDataStub {
        this.language = language;
        return this;
    }

    public withStartCode(startCode: string): ScriptingDefinitionDataStub {
        this.startCode = startCode;
        return this;
    }

    public withEndCode(endCode: string): ScriptingDefinitionDataStub {
        this.endCode = endCode;
        return this;
    }

    public withExtension(extension: string): ScriptingDefinitionDataStub {
        this.fileExtension = extension;
        return this;
    }
}
