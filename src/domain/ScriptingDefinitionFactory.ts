import { ScriptingLanguage } from './ScriptingLanguage';
import type { ScriptingDefinition } from './ScriptingDefinition';

export type ScriptingDefinitionFactory = (
  parameters: ScriptingDefinitionInitParameters,
) => ScriptingDefinition;

interface ScriptingDefinitionInitParameters {
  readonly language: ScriptingLanguage;
  readonly startCode: string;
  readonly endCode: string;
}

export const createScriptingDefinition: ScriptingDefinitionFactory = (
  parameters,
) => {
  validateCode(parameters.startCode, 'start code');
  validateCode(parameters.endCode, 'end code');
  return {
    language: parameters.language,
    startCode: parameters.startCode,
    endCode: parameters.endCode,
    fileExtension: findExtension(parameters.language),
  };
};

function findExtension(language: ScriptingLanguage): string {
  switch (language) {
    case ScriptingLanguage.shellscript:
      return 'sh';
    case ScriptingLanguage.batchfile:
      return 'bat';
    default:
      throw new Error(`unsupported language: ${language}`);
  }
}

function validateCode(code: string, name: string) {
  if (!code) {
    throw new Error(`missing ${name}`);
  }
}
