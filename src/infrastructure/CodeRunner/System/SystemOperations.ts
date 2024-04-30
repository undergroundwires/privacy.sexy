import type { exec } from 'node:child_process';

export interface SystemOperations {
  readonly operatingSystem: OperatingSystemOps;
  readonly location: LocationOps;
  readonly fileSystem: FileSystemOps;
  readonly command: CommandOps;
}

export interface OperatingSystemOps {
  getUserDataDirectory(): string;
}

export interface LocationOps {
  combinePaths(...pathSegments: string[]): string;
}

export interface CommandOps {
  exec(command: string): ReturnType<typeof exec>;
}

export interface FileSystemOps {
  setFilePermissions(filePath: string, mode: string | number): Promise<void>;
  createDirectory(directoryPath: string, isRecursive?: boolean): Promise<void>;
}
