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
      createDirectory: async (
        directoryPath: string,
        isRecursive?: boolean,
      ) => {
        await mkdir(directoryPath, { recursive: isRecursive });
        // Ignoring the return value from `mkdir`, which is the first directory created
        // when `recursive` is true. The function contract is to not return any value,
        // and we avoid handling this inconsistent behavior.
        // See https://github.com/nodejs/node/pull/31530
      },
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
