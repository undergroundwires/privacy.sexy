import { type ChildProcess } from 'node:child_process';
import type { CommandOps } from '@/infrastructure/CodeRunner/System/SystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';
import { ChildProcessStub } from './ChildProcesssStub';

export class CommandOpsStub
  extends StubWithObservableMethodCalls<CommandOps>
  implements CommandOps {
  private childProcess: ChildProcess = new ChildProcessStub()
    .withAutoEmitExit(true)
    .asChildProcess();

  public withChildProcess(childProcess: ChildProcess): this {
    this.childProcess = childProcess;
    return this;
  }

  public exec(command: string): ChildProcess {
    this.registerMethodCall({
      methodName: 'exec',
      args: [command],
    });
    return this.childProcess;
  }
}
