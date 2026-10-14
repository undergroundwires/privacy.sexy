import type { CommandOps, CommandProcess } from '@/infrastructure/CodeRunner/System/SystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';
import { ChildProcessStub } from './ChildProcesssStub';

export class CommandOpsStub
  extends StubWithObservableMethodCalls<CommandOps>
  implements CommandOps {
  private childProcess: CommandProcess = new ChildProcessStub()
    .withAutoEmitExit(true)
    .asChildProcess();

  public withChildProcess(childProcess: CommandProcess): this {
    this.childProcess = childProcess;
    return this;
  }

  public exec(command: string): CommandProcess {
    this.registerMethodCall({
      methodName: 'exec',
      args: [command],
    });
    return this.childProcess;
  }
}
