import type { PowerShellInvokeShellCommandCreator } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Commands/PowerShellInvoke/PowerShellInvokeShellCommandCreator';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class PowerShellInvokeShellCommandCreatorStub
  extends StubWithObservableMethodCalls<PowerShellInvokeShellCommandCreator>
  implements PowerShellInvokeShellCommandCreator {
  private command: string | undefined;

  public withCreatedCommand(command: string): this {
    this.command = command;
    return this;
  }

  public createCommandToInvokePowerShell(powerShellCommand: string): string {
    this.registerMethodCall({
      methodName: 'createCommandToInvokePowerShell',
      args: [powerShellCommand],
    });
    if (this.command === undefined) {
      return `[${PowerShellInvokeShellCommandCreatorStub.name}] ${powerShellCommand}`;
    }
    return this.command;
  }
}
