import { ScriptingLanguage } from './ScriptingLanguage';
import type { IScriptingDefinition } from './IScriptingDefinition';

export class ScriptingDefinition implements IScriptingDefinition {
  public readonly fileExtension: string;

  constructor(
    public readonly language: ScriptingLanguage,
    public readonly startCode: string,
    public readonly endCode: string,
  ) {
    this.fileExtension = findExtension(language);
    validateCode(startCode, 'start code');
    validateCode(endCode, 'end code');
  }
}

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
