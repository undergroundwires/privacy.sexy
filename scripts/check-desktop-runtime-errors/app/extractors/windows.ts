import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { findSingleFileByExtension, exists } from '../../utils/io';
import { log, die, LogLevel } from '../../utils/log';
import { runCommand } from '../../utils/run-command';
import { ExtractionResult } from './extraction-result';

export async function prepareWindowsApp(
  desktopDistPath: string,
): Promise<ExtractionResult> {
  const workdir = await mkdtemp(join(tmpdir(), 'win-nsis-installation-'));
  if (await exists(workdir)) {
    log(`Temporary directory ${workdir} already exists, cleaning up...`);
    await rm(workdir, { recursive: true });
  }
  const appExecutablePath = await installNsis(workdir, desktopDistPath);
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
): Promise<string> {
  const { absolutePath: installerPath } = await findSingleFileByExtension('exe', desktopDistPath);

  log(`Silently installing contents of ${installerPath} to ${installationPath}...`);
  const { error } = await runCommand(`"${installerPath}" /S /D=${installationPath}`);
  if (error) {
    return die(`Failed to install.\n${error}`);
  }

  const { absolutePath: appExecutablePath } = await findSingleFileByExtension('exe', installationPath);

  return appExecutablePath;
}
