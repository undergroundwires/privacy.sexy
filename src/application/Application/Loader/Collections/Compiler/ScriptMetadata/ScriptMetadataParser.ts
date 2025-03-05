import type { ScriptMetadataData } from '@/application/collections/';
import type { ScriptMetadata } from '@/domain/ScriptMetadata/ScriptMetadata';
import { createScriptMetadata, type ScriptMetadataFactory } from '@/domain/ScriptMetadata/ScriptMetadataFactory';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { createEnumParser, type EnumParser } from '@/application/Common/Enum';
import { createTypeValidator, type TypeValidator } from '@/application/Common/TypeValidator';
import { type CodeSubstituter, substituteCode } from './CodeSubstituter';

export const parseScriptMetadata: ScriptMetadataParser = (
  definition,
  projectDetails,
  utilities: ScriptMetadataParserUtilities = DefaultUtilities,
) => {
  validateData(definition, utilities.validator);
  const language = utilities.languageParser.parseEnum(definition.language, 'language');
  const startCode = utilities.codeSubstituter(definition.startCode, projectDetails);
  const endCode = utilities.codeSubstituter(definition.endCode, projectDetails);
  return utilities.createScriptMetadata({
    language,
    startCode,
    endCode,
  });
};

export interface ScriptMetadataParser {
  (
    definition: ScriptMetadataData,
    projectDetails: ProjectDetails,
    utilities?: ScriptMetadataParserUtilities,
  ): ScriptMetadata;
}

function validateData(
  data: ScriptMetadataData,
  validator: TypeValidator,
): void {
  validator.assertObject({
    value: data,
    valueName: 'script metadata',
    allowedProperties: ['language', 'fileExtension', 'startCode', 'endCode'],
  });
}

interface ScriptMetadataParserUtilities {
  readonly languageParser: EnumParser<ScriptLanguage>;
  readonly codeSubstituter: CodeSubstituter;
  readonly validator: TypeValidator;
  readonly createScriptMetadata: ScriptMetadataFactory;
}

const DefaultUtilities: ScriptMetadataParserUtilities = {
  languageParser: createEnumParser(ScriptLanguage),
  codeSubstituter: substituteCode,
  validator: createTypeValidator(),
  createScriptMetadata,
};
