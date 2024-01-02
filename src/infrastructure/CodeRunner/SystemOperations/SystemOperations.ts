export interface SystemOperations {
  readonly operatingSystem: OperatingSystemOps;
  readonly location: LocationOps;
  readonly fileSystem: FileSystemOps;
  readonly command: CommandOps;
}

export interface OperatingSystemOps {
  getTempDirectory(): string;
}

export interface LocationOps {
  combinePaths(...pathSegments: string[]): string;
}

export interface CommandOps {
  exec(command: string): Promise<void>;
}

export interface FileSystemOps {
  setFilePermissions(filePath: string, mode: string | number): Promise<void>;
  createDirectory(directoryPath: string, isRecursive?: boolean): Promise<void>;
  writeToFile(filePath: string, data: string): Promise<void>;
}
