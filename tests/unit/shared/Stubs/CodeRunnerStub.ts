import { CodeRunOutcome, CodeRunner } from '@/application/CodeRunner/CodeRunner';

export class CodeRunnerStub implements CodeRunner {
  public runCode(): Promise<CodeRunOutcome> {
    return Promise.resolve({
      success: true,
    });
  }
}
