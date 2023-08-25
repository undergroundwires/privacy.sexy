import { tmpdir } from 'os';
import { join } from 'path';
import { chmod, mkdir, writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { ISystemOperations } from './ISystemOperations';

export function createNodeSystemOperations(): ISystemOperations {
  return {
    operatingSystem: {
      getTempDirectory: () => tmpdir(),
    },
    location: {
      combinePaths: (...pathSegments) => join(...pathSegments),
    },
    fileSystem: {
      setFilePermissions: (
        filePath: string,
        mode: string | number,
      ) => chmod(filePath, mode),
      createDirectory: (
        directoryPath: string,
        isRecursive?: boolean,
      ) => mkdir(directoryPath, { recursive: isRecursive }),
      writeToFile: (
        filePath: string,
        data: string,
      ) => writeFile(filePath, data),
    },
    command: {
      execute: (command) => exec(command),
    },
  };
}
