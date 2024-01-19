import { readdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';

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
