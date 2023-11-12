export interface ISystemOperations {
  readonly operatingSystem: IOperatingSystemOps;
  readonly location: ILocationOps;
  readonly fileSystem: IFileSystemOps;
  readonly command: ICommandOps;
}

export interface IOperatingSystemOps {
  getTempDirectory(): string;
}

export interface ILocationOps {
  combinePaths(...pathSegments: string[]): string;
}

export interface ICommandOps {
  execute(command: string): void;
}

export interface IFileSystemOps {
  setFilePermissions(filePath: string, mode: string | number): Promise<void>;
  createDirectory(directoryPath: string, isRecursive?: boolean): Promise<void>;
  writeToFile(filePath: string, data: string): Promise<void>;
}
