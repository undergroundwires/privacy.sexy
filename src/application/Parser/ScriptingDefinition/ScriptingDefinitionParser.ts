import { ScriptingDefinitionData } from 'js-yaml-loader!@/*';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ScriptingDefinition } from '@/domain/ScriptingDefinition';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { createEnumParser } from '../../Common/Enum';
import { ICodeSubstituter } from './ICodeSubstituter';
import { CodeSubstituter } from './CodeSubstituter';

export class ScriptingDefinitionParser {
  constructor(
    private readonly languageParser = createEnumParser(ScriptingLanguage),
    private readonly codeSubstituter: ICodeSubstituter = new CodeSubstituter(),
  ) {
  }

  public parse(
    definition: ScriptingDefinitionData,
    info: IProjectInformation,
  ): IScriptingDefinition {
    if (!info) { throw new Error('missing info'); }
    if (!definition) { throw new Error('missing definition'); }
    const language = this.languageParser.parseEnum(definition.language, 'language');
    const startCode = this.codeSubstituter.substitute(definition.startCode, info);
    const endCode = this.codeSubstituter.substitute(definition.endCode, info);
    return new ScriptingDefinition(
      language,
      startCode,
      endCode,
    );
  }
}
