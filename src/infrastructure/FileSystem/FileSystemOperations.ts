export interface FileSystemOperations {
  getUserDataDirectory(): string;

  setFilePermissions(filePath: string, mode: string | number): Promise<void>;
  createDirectory(directoryPath: string, isRecursive?: boolean): Promise<void>;

  isFileAvailable(filePath: string): Promise<boolean>;
  isDirectoryAvailable(filePath: string): Promise<boolean>;
  deletePath(filePath: string): Promise<void>;
  listDirectoryContents(directoryPath: string): Promise<string[]>;

  combinePaths(...pathSegments: string[]): string;

  readFile: (filePath: string, encoding: NodeJS.BufferEncoding) => Promise<string>;
  writeFile: (
    filePath: string,
    fileContents: string,
    encoding: NodeJS.BufferEncoding,
  ) => Promise<void>;
}
