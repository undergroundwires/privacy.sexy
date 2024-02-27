import type { ScriptingDefinitionData } from '@/application/collections/';
import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ScriptingDefinition } from '@/domain/ScriptingDefinition';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { createEnumParser } from '../../Common/Enum';
import { CodeSubstituter } from './CodeSubstituter';
import type { ICodeSubstituter } from './ICodeSubstituter';

export class ScriptingDefinitionParser {
  constructor(
    private readonly languageParser = createEnumParser(ScriptingLanguage),
    private readonly codeSubstituter: ICodeSubstituter = new CodeSubstituter(),
  ) {
  }

  public parse(
    definition: ScriptingDefinitionData,
    projectDetails: ProjectDetails,
  ): IScriptingDefinition {
    const language = this.languageParser.parseEnum(definition.language, 'language');
    const startCode = this.codeSubstituter.substitute(definition.startCode, projectDetails);
    const endCode = this.codeSubstituter.substitute(definition.endCode, projectDetails);
    return new ScriptingDefinition(
      language,
      startCode,
      endCode,
    );
  }
}
