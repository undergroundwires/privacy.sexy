import { mkdtemp, rmdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { findSingleFileByExtension, exists } from '../../utils/io.js';
import { log, die } from '../../utils/log.js';
import { runCommand } from '../../utils/run-command.js';

export async function prepareWindowsApp(desktopDistPath) {
  const workdir = await mkdtemp(join(tmpdir(), 'win-nsis-installation-'));
  if (await exists(workdir)) {
    log(`Temporary directory ${workdir} already exists, cleaning up...`);
    await rmdir(workdir, { recursive: true });
  }
  const { appExecutablePath } = await installNsis(workdir, desktopDistPath);
  return {
    appExecutablePath,
    cleanup: async () => {
      log(`Cleaning up working directory ${workdir}...`);
      await rmdir(workdir, { recursive: true });
    },
  };
}

async function installNsis(installationPath, desktopDistPath) {
  const { absolutePath: installerPath } = await findSingleFileByExtension('exe', desktopDistPath);

  log(`Silently installing contents of ${installerPath} to ${installationPath}...`);
  const { error } = await runCommand(`"${installerPath}" /S /D=${installationPath}`);
  if (error) {
    die(`Failed to install.\n${error}`);
  }

  const { absolutePath: appExecutablePath } = await findSingleFileByExtension('exe', installationPath);

  return {
    appExecutablePath,
  };
}
