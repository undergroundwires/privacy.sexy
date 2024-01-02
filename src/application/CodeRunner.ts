export interface CodeRunner {
  runCode(
    code: string,
    tempScriptFolderName: string,
  ): Promise<void>;
}
