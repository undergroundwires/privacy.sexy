import { CodeRunner } from '@/application/CodeRunner/CodeRunner';

export class CodeRunnerStub implements CodeRunner {
  public runCode(): Promise<void> {
    return Promise.resolve();
  }
}
