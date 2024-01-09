export interface CodeRunner {
  runCode(
    code: string,
    fileExtension: string,
  ): Promise<void>;
}
