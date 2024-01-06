import { join } from 'node:path';
import { chmod, mkdir, writeFile } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { app } from 'electron/main';
import {
  CommandOps, FileSystemOps, LocationOps, OperatingSystemOps, SystemOperations,
} from './SystemOperations';

export class NodeElectronSystemOperations implements SystemOperations {
  public readonly operatingSystem: OperatingSystemOps = {
    /*
      This method returns the directory for storing app's configuration files.
      It appends your app's name to the default appData directory.
      Conventionally, you should store user data files in this directory.
      However, avoid writing large files here as some environments might back up this directory
      to cloud storage, potentially causing issues with file size.

      Based on tests it returns:

      - Windows: `%APPDATA%\privacy.sexy`
      - Linux: `$HOME/.config/privacy.sexy/runs`
      - macOS: `$HOME/Library/Application Support/privacy.sexy/runs`

      For more details, refer to the Electron documentation: https://web.archive.org/web/20240104154857/https://www.electronjs.org/docs/latest/api/app#appgetpathname
    */
    getUserDataDirectory: () => {
      return app.getPath('userData');
    },
  };

  public readonly location: LocationOps = {
    combinePaths: (...pathSegments) => join(...pathSegments),
  };

  public readonly fileSystem: FileSystemOps = {
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
      // when `recursive` is true, or empty return value.
      // See https://github.com/nodejs/node/pull/31530
    },
    writeToFile: (
      filePath: string,
      data: string,
    ) => writeFile(filePath, data),
  };

  public readonly command: CommandOps = {
    exec: (command) => new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    }),
  };
}
