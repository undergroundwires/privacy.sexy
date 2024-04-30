import type { ExecutablePermissionSetter } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Runner/PermissionSetter/ExecutablePermissionSetter';
import type { ScriptFileExecutionOutcome } from '@/infrastructure/CodeRunner/Execution/ScriptFileExecutor';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class ExecutablePermissionSetterStub
  extends StubWithObservableMethodCalls<ExecutablePermissionSetter>
  implements ExecutablePermissionSetter {
  private outcome: ScriptFileExecutionOutcome = {
    success: true,
  };

  public withOutcome(outcome: ScriptFileExecutionOutcome): this {
    this.outcome = outcome;
    return this;
  }

  public makeFileExecutable(filePath: string): Promise<ScriptFileExecutionOutcome> {
    this.registerMethodCall({
      methodName: 'makeFileExecutable',
      args: [filePath],
    });
    return Promise.resolve(this.outcome);
  }
}
