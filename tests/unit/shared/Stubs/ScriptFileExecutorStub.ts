import type { ScriptFileExecutionOutcome, ScriptFileExecutor } from '@/infrastructure/CodeRunner/Execution/ScriptFileExecutor';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class ScriptFileExecutorStub
  extends StubWithObservableMethodCalls<ScriptFileExecutor>
  implements ScriptFileExecutor {
  public executeScriptFile(filePath: string): Promise<ScriptFileExecutionOutcome> {
    this.registerMethodCall({
      methodName: 'executeScriptFile',
      args: [filePath],
    });
    return Promise.resolve({
      success: true,
    });
  }
}
