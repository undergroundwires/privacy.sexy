import { ICommandOps } from '@/infrastructure/Environment/SystemOperations/ISystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class CommandOpsStub
  extends StubWithObservableMethodCalls<ICommandOps>
  implements ICommandOps {
  public execute(command: string): void {
    this.registerMethodCall({
      methodName: 'execute',
      args: [command],
    });
  }
}
