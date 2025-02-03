import { ScriptLanguage } from './ScriptLanguage';
import type { ScriptMetadata } from './ScriptMetadata';

export type ScriptMetadataFactory = (
  parameters: ScriptMetadataInitParameters,
) => ScriptMetadata;

export interface ScriptMetadataInitParameters {
  readonly language: ScriptLanguage;
  readonly startCode: string;
  readonly endCode: string;
}

export const createScriptMetadata: ScriptMetadataFactory = (
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

function findExtension(language: ScriptLanguage): string {
  switch (language) {
    case ScriptLanguage.shellscript:
      return 'sh';
    case ScriptLanguage.batchfile:
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
