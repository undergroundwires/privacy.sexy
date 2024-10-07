import { join } from 'node:path';
import {
  chmod, mkdir,
  readdir, rm, stat,
  readFile, writeFile,
} from 'node:fs/promises';
import { app } from 'electron/main';
import type { FileSystemOperations } from './FileSystemOperations';
import type { Stats } from 'node:original-fs';

/**
 * Thin wrapper for Node and Electron APIs.
 */
export const NodeElectronFileSystemOperations: FileSystemOperations = {
  combinePaths: (...pathSegments) => join(...pathSegments),
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
  isFileAvailable: async (path) => isPathAvailable(path, (stats) => stats.isFile()),
  isDirectoryAvailable: async (path) => isPathAvailable(path, (stats) => stats.isDirectory()),
  deletePath: (path) => rm(path, { recursive: true, force: true }),
  listDirectoryContents: (directoryPath) => readdir(directoryPath),
  getUserDataDirectory: () => {
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
    return app.getPath('userData');
  },
  writeFile,
  readFile,
};

async function isPathAvailable(
  path: string,
  condition: (stats: Stats) => boolean,
): Promise<boolean> {
  try {
    const stats = await stat(path);
    return condition(stats);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false; // path does not exist
    }
    throw error;
  }
}
