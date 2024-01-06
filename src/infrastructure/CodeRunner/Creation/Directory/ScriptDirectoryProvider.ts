export interface ScriptDirectoryProvider {
  provideScriptDirectory(): Promise<string>;
}
