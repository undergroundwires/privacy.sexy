import { access, chmod } from 'node:fs/promises';
import { constants } from 'node:fs';
import { log } from '../../utils/log';
import { findByFilePattern } from './common/app-artifact-locator';
import type { ExtractionResult } from './common/extraction-result';

export async function prepareLinuxApp(
  desktopDistPath: string,
  projectRootDir: string,
): Promise<ExtractionResult> {
  const { absolutePath: appFile } = await findByFilePattern(
    // eslint-disable-next-line no-template-curly-in-string
    '${name}-${version}.AppImage',
    desktopDistPath,
    projectRootDir,
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
