import { extname, join } from 'path';
import { readdir, access } from 'fs/promises';
import { constants } from 'fs';
import { log, die, LOG_LEVELS } from './log.js';

export async function findSingleFileByExtension(extension, directory) {
  if (!directory) { throw new Error('Missing directory'); }
  if (!extension) { throw new Error('Missing file extension'); }

  if (!await exists(directory)) {
    die(`Directory does not exist: ${directory}`);
    return [];
  }

  const directoryContents = await readdir(directory);
  const foundFileNames = directoryContents.filter((file) => extname(file) === `.${extension}`);
  const withoutUninstaller = foundFileNames.filter(
    (fileName) => !fileName.toLowerCase().includes('uninstall'), // NSIS build has `Uninstall {app-name}.exe`
  );
  if (!withoutUninstaller.length) {
    die(`No ${extension} found in ${directory} directory.`);
  }
  if (withoutUninstaller.length > 1) {
    log(`Found multiple ${extension} files: ${withoutUninstaller.join(', ')}. Using first occurrence`, LOG_LEVELS.WARN);
  }
  return {
    absolutePath: join(directory, withoutUninstaller[0]),
  };
}

export async function exists(path) {
  if (!path) { throw new Error('Missing path'); }
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function isDirMissingOrEmpty(dir) {
  if (!dir) { throw new Error('Missing directory'); }
  if (!await exists(dir)) {
    return true;
  }
  const contents = await readdir(dir);
  return contents.length === 0;
}
