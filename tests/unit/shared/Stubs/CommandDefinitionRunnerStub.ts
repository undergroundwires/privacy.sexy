import type { CommandDefinition } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/CommandDefinition';
import type { CommandDefinitionRunner } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Runner/CommandDefinitionRunner';
import type { ScriptFileExecutionOutcome } from '@/infrastructure/CodeRunner/Execution/ScriptFileExecutor';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class CommandDefinitionRunnerStub
  extends StubWithObservableMethodCalls<CommandDefinitionRunner>
  implements CommandDefinitionRunner {
  private outcome: ScriptFileExecutionOutcome = {
    success: true,
  };

  public withOutcome(outcome: ScriptFileExecutionOutcome): this {
    this.outcome = outcome;
    return this;
  }

  public runCommandDefinition(
    commandDefinition: CommandDefinition,
    filePath: string,
  ): Promise<ScriptFileExecutionOutcome> {
    this.registerMethodCall({
      methodName: 'runCommandDefinition',
      args: [commandDefinition, filePath],
    });
    return Promise.resolve(this.outcome);
  }
}
