export interface ScriptFileExecutor {
  executeScriptFile(filePath: string): Promise<void>;
}
