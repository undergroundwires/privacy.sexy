export interface ScriptFileCreator {
  createScriptFile(contents: string): Promise<string>;
}
