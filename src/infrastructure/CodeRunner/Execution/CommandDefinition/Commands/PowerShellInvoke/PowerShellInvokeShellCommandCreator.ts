export interface PowerShellInvokeShellCommandCreator {
  createCommandToInvokePowerShell(powerShellCommand: string): string;
}
