import type { CommandDefinition } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/CommandDefinition';

export class CommandDefinitionStub implements CommandDefinition {
  private requireExecutablePermissions = false;

  private exitCodeToTerminationStatus: Map<number, boolean> = new Map<number, boolean>();

  public withExecutablePermissionsRequirement(requireExecutablePermissions: boolean): this {
    this.requireExecutablePermissions = requireExecutablePermissions;
    return this;
  }

  public withExternalTerminationStatusForExitCode(exitCode: number, state: boolean): this {
    this.exitCodeToTerminationStatus.set(exitCode, state);
    return this;
  }

  public buildShellCommand(filePath: string): string {
    return `[${CommandDefinitionStub.name}] ${filePath}`;
  }

  public isExecutionTerminatedExternally(exitCode: number): boolean {
    const status = this.exitCodeToTerminationStatus.get(exitCode);
    if (status === undefined) {
      return false;
    }
    return status;
  }

  public isExecutablePermissionsRequiredOnFile(): boolean {
    return this.requireExecutablePermissions;
  }
}
