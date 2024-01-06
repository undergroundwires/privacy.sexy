import { CommandOps } from '@/infrastructure/CodeRunner/System/SystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class CommandOpsStub
  extends StubWithObservableMethodCalls<CommandOps>
  implements CommandOps {
  public exec(command: string): Promise<void> {
    this.registerMethodCall({
      methodName: 'exec',
      args: [command],
    });
    return Promise.resolve();
  }
}
