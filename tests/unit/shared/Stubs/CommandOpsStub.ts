import { CommandOps } from '@/infrastructure/CodeRunner/SystemOperations/SystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class CommandOpsStub
  extends StubWithObservableMethodCalls<CommandOps>
  implements CommandOps {
  public execute(command: string): Promise<void> {
    this.registerMethodCall({
      methodName: 'execute',
      args: [command],
    });
    return Promise.resolve();
  }
}
