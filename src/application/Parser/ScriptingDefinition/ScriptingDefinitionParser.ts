import type { ScriptingDefinitionData } from '@/application/collections/';
import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ScriptingDefinition } from '@/domain/ScriptingDefinition';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { createEnumParser, type EnumParser } from '../../Common/Enum';
import { createTypeValidator, type TypeValidator } from '../Common/TypeValidator';
import { type CodeSubstituter, substituteCode } from './CodeSubstituter';

export const parseScriptingDefinition: ScriptingDefinitionParser = (
  definition,
  projectDetails,
  utilities: ScriptingDefinitionParserUtilities = DefaultUtilities,
) => {
  validateData(definition, utilities.validator);
  const language = utilities.languageParser.parseEnum(definition.language, 'language');
  const startCode = utilities.codeSubstituter(definition.startCode, projectDetails);
  const endCode = utilities.codeSubstituter(definition.endCode, projectDetails);
  return new ScriptingDefinition(
    language,
    startCode,
    endCode,
  );
};

export interface ScriptingDefinitionParser {
  (
    definition: ScriptingDefinitionData,
    projectDetails: ProjectDetails,
    utilities?: ScriptingDefinitionParserUtilities,
  ): IScriptingDefinition;
}

function validateData(
  data: ScriptingDefinitionData,
  validator: TypeValidator,
): void {
  validator.assertObject({
    value: data,
    valueName: 'scripting definition',
    allowedProperties: ['language', 'fileExtension', 'startCode', 'endCode'],
  });
}

interface ScriptingDefinitionParserUtilities {
  readonly languageParser: EnumParser<ScriptingLanguage>;
  readonly codeSubstituter: CodeSubstituter;
  readonly validator: TypeValidator;
}

const DefaultUtilities: ScriptingDefinitionParserUtilities = {
  languageParser: createEnumParser(ScriptingLanguage),
  codeSubstituter: substituteCode,
  validator: createTypeValidator(),
};
