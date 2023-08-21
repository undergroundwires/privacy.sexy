import { access, chmod } from 'fs/promises';
import { constants } from 'fs';
import { findSingleFileByExtension } from '../../utils/io.js';
import { log } from '../../utils/log.js';

export async function prepareLinuxApp(desktopDistPath) {
  const { absolutePath: appFile } = await findSingleFileByExtension(
    'AppImage',
    desktopDistPath,
  );
  await makeExecutable(appFile);
  return {
    appExecutablePath: appFile,
  };
}

async function makeExecutable(appFile) {
  if (!appFile) { throw new Error('missing file'); }
  if (await isExecutable(appFile)) {
    log('AppImage is already executable.');
    return;
  }
  log('Making it executable...');
  await chmod(appFile, 0o755);
}

async function isExecutable(file) {
  try {
    await access(file, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
