import type { ScriptingDefinitionData } from '@/application/collections/';
import type { ScriptingDefinition } from '@/domain/ScriptingDefinition';
import { ScriptingDefinition } from '@/domain/ScriptingDefinitionFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { createEnumParser, type EnumParser } from '../../../Common/Enum';
import { createTypeValidator, type TypeValidator } from '../../Common/TypeValidator';
import { type CodeSubstituter, substituteCode } from './CodeSubstituter';

export const parseScriptingDefinition: ScriptingDefinitionCompiler = (
  definition,
  projectDetails,
  utilities: ScriptingDefinitionParserUtilities = DefaultUtilities,
) => {
  validateData(definition, utilities.validator);
  const language = utilities.languageParser.parseEnum(definition.language, 'language');
  const startCode = utilities.codeSubstituter(definition.startCode, projectDetails);
  const endCode = utilities.codeSubstituter(definition.endCode, projectDetails);
  return new ScriptingDefinitionDto(
    language,
    startCode,
    endCode,
  );
};

export interface ScriptingDefinitionCompiler {
  (
    definition: ScriptingDefinitionData,
    projectDetails: ProjectDetails,
    utilities?: ScriptingDefinitionParserUtilities,
  ): ScriptingDefinition;
}

function validateData(
  data: ScriptingDefinitionData,
  validator: TypeValidator,
): void {
  validator.assertObject({
    value: data,
    valueName: 'Scripting definition',
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
