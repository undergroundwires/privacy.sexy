import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { exists } from '../../utils/io';
import { log, die, LogLevel } from '../../utils/log';
import { runCommand } from '../../utils/run-command';
import { ExtractionResult } from './common/extraction-result';
import { findByFilePattern } from './common/app-artifact-locator';

export async function prepareWindowsApp(
  desktopDistPath: string,
  projectRootDir: string,
): Promise<ExtractionResult> {
  const workdir = await mkdtemp(join(tmpdir(), 'win-nsis-installation-'));
  if (await exists(workdir)) {
    log(`Temporary directory ${workdir} already exists, cleaning up...`);
    await rm(workdir, { recursive: true });
  }
  const appExecutablePath = await installNsis(workdir, desktopDistPath, projectRootDir);
  return {
    appExecutablePath,
    cleanup: async () => {
      log(`Cleaning up working directory ${workdir}...`);
      try {
        await rm(workdir, { recursive: true, force: true });
      } catch (error) {
        log(`Could not cleanup the working directory: ${error.message}`, LogLevel.Error);
      }
    },
  };
}

async function installNsis(
  installationPath: string,
  desktopDistPath: string,
  projectRootDir: string,
): Promise<string> {
  const { absolutePath: installerPath } = await findByFilePattern(
    // eslint-disable-next-line no-template-curly-in-string
    '${name}-Setup-${version}.exe',
    desktopDistPath,
    projectRootDir,
  );
  log(`Silently installing contents of ${installerPath} to ${installationPath}...`);
  const { error } = await runCommand(`"${installerPath}" /S /D=${installationPath}`);
  if (error) {
    return die(`Failed to install.\n${error}`);
  }

  const { absolutePath: appExecutablePath } = await findByFilePattern(
    // eslint-disable-next-line no-template-curly-in-string
    '${name}.exe',
    installationPath,
    projectRootDir,
  );

  return appExecutablePath;
}
