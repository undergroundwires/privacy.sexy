import { extname, join } from 'path';
import { readdir, access } from 'fs/promises';
import { constants } from 'fs';
import { log, die, LogLevel } from './log';

export async function findSingleFileByExtension(
  extension: string,
  directory: string,
): Promise<FileSearchResult> {
  if (!directory) { throw new Error('Missing directory'); }
  if (!extension) { throw new Error('Missing file extension'); }

  if (!await exists(directory)) {
    return die(`Directory does not exist: ${directory}`);
  }

  const directoryContents = await readdir(directory);
  const foundFileNames = directoryContents.filter((file) => extname(file) === `.${extension}`);
  const withoutUninstaller = foundFileNames.filter(
    (fileName) => !fileName.toLowerCase().includes('uninstall'), // NSIS build has `Uninstall {app-name}.exe`
  );
  if (!withoutUninstaller.length) {
    return die(`No ${extension} found in ${directory} directory.`);
  }
  if (withoutUninstaller.length > 1) {
    log(`Found multiple ${extension} files: ${withoutUninstaller.join(', ')}. Using first occurrence`, LogLevel.Warn);
  }
  return {
    absolutePath: join(directory, withoutUninstaller[0]),
  };
}

interface FileSearchResult {
  readonly absolutePath?: string;
}

export async function exists(path: string): Promise<boolean> {
  if (!path) { throw new Error('Missing path'); }
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function isDirMissingOrEmpty(dir: string): Promise<boolean> {
  if (!dir) { throw new Error('Missing directory'); }
  if (!await exists(dir)) {
    return true;
  }
  const contents = await readdir(dir);
  return contents.length === 0;
}
