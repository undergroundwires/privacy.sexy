import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ScriptingDefinitionData } from 'js-yaml-loader!@/*';
import { ScriptingDefinition } from '@/domain/ScriptingDefinition';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { createEnumParser } from '../Common/Enum';
import { generateIlCode } from './Script/Compiler/Expressions/ILCode';

export function parseScriptingDefinition(
    definition: ScriptingDefinitionData,
    info: IProjectInformation,
    date = new Date(),
    languageParser = createEnumParser(ScriptingLanguage)): IScriptingDefinition {
    if (!info) {
        throw new Error('undefined info');
    }
    if (!definition) {
        throw new Error('undefined definition');
    }
    const language = languageParser.parseEnum(definition.language, 'language');
    const startCode = applySubstitutions(definition.startCode, info, date);
    const endCode = applySubstitutions(definition.endCode, info, date);
    return new ScriptingDefinition(
        language,
        startCode,
        endCode,
    );
}

function applySubstitutions(code: string, info: IProjectInformation, date: Date): string {
    let ilCode = generateIlCode(code);
    ilCode = ilCode.substituteParameter('homepage', info.homepage);
    ilCode = ilCode.substituteParameter('version', info.version);
    ilCode = ilCode.substituteParameter('date', date.toUTCString());
    return ilCode.compile();
}
