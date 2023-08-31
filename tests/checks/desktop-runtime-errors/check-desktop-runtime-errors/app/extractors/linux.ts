import { access, chmod } from 'fs/promises';
import { constants } from 'fs';
import { log } from '../../utils/log';
import { ExtractionResult } from './common/extraction-result';
import { findByFilePattern } from './common/app-artifact-locator';

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
