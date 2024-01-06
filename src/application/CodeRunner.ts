export interface CodeRunner {
  runCode(
    code: string,
  ): Promise<void>;
}
