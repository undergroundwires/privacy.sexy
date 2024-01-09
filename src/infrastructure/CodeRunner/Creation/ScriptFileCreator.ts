export interface ScriptFileCreator {
  createScriptFile(
    contents: string,
    scriptFileNameParts: ScriptFileNameParts,
  ): Promise<string>;
}

export interface ScriptFileNameParts {
  readonly scriptName: string;
  readonly scriptFileExtension: string | undefined;
}
