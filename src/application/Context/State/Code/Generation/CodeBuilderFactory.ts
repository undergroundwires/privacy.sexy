import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ICodeBuilder } from './ICodeBuilder';
import { ICodeBuilderFactory } from './ICodeBuilderFactory';
import { BatchBuilder } from './Languages/BatchBuilder';
import { ShellBuilder } from './Languages/ShellBuilder';

export class CodeBuilderFactory implements ICodeBuilderFactory {
    public create(language: ScriptingLanguage): ICodeBuilder {
        switch (language) {
            case ScriptingLanguage.shellscript: return new ShellBuilder();
            case ScriptingLanguage.batchfile:   return new BatchBuilder();
            default: throw new RangeError(`unknown language: "${ScriptingLanguage[language]}"`);
        }
    }
}
