import type { ShellCommandOutcome, ShellCommandRunner } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Runner/ShellRunner/ShellCommandRunner';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class ShellCommandRunnerStub
  extends StubWithObservableMethodCalls<ShellCommandRunner>
  implements ShellCommandRunner {
  private outcome: ShellCommandOutcome = {
    type: 'RegularProcessExit',
    exitCode: 0,
  };

  public withOutcome(outcome: ShellCommandOutcome): this {
    this.outcome = outcome;
    return this;
  }

  public runShellCommand(command: string): Promise<ShellCommandOutcome> {
    this.registerMethodCall({
      methodName: 'runShellCommand',
      args: [command],
    });
    return Promise.resolve(this.outcome);
  }
}
