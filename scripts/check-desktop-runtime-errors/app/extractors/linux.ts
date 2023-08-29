import { access, chmod } from 'fs/promises';
import { constants } from 'fs';
import { findSingleFileByExtension } from '../../utils/io';
import { log } from '../../utils/log';
import { ExtractionResult } from './extraction-result';

export async function prepareLinuxApp(
  desktopDistPath: string,
): Promise<ExtractionResult> {
  const { absolutePath: appFile } = await findSingleFileByExtension(
    'AppImage',
    desktopDistPath,
  );
  await makeExecutable(appFile);
  return {
    appExecutablePath: appFile,
  };
}

async function makeExecutable(appFile: string): Promise<void> {
  if (!appFile) { throw new Error('missing file'); }
  if (await isExecutable(appFile)) {
    log('AppImage is already executable.');
    return;
  }
  log('Making it executable...');
  await chmod(appFile, 0o755);
}

async function isExecutable(file: string): Promise<boolean> {
  try {
    await access(file, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
