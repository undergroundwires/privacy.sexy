export interface CommandDefinition {
  buildShellCommand(filePath: string): string;
  isExecutionTerminatedExternally(exitCode: number): boolean;
  isExecutablePermissionsRequiredOnFile(): boolean;
}
