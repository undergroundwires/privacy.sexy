import { runCommand } from '../../utils/run-command';
import { exists } from '../../utils/io';
import { log, die, LogLevel } from '../../utils/log';
import { sleep } from '../../utils/sleep';
import { ExtractionResult } from './common/extraction-result';
import { findByFilePattern } from './common/app-artifact-locator';

export async function prepareMacOsApp(
  desktopDistPath: string,
  projectRootDir: string,
): Promise<ExtractionResult> {
  const { absolutePath: dmgPath } = await findByFilePattern(
    // eslint-disable-next-line no-template-curly-in-string
    '${name}-${version}.dmg',
    desktopDistPath,
    projectRootDir,
  );
  const { mountPath } = await mountDmg(dmgPath);
  const appPath = await findMacAppExecutablePath(mountPath);
  return {
    appExecutablePath: appPath,
    cleanup: async () => {
      log('Cleaning up resources...');
      await detachMount(mountPath);
    },
  };
}

async function mountDmg(
  dmgFile: string,
) {
  const { stdout: hdiutilOutput, error } = await runCommand(
    `hdiutil attach '${dmgFile}'`,
  );
  if (error) {
    die(`Failed to mount DMG file at ${dmgFile}.\n${error}`);
  }
  const mountPathMatch = hdiutilOutput.match(/\/Volumes\/[^\n]+/);
  const mountPath = mountPathMatch ? mountPathMatch[0] : null;
  return {
    mountPath,
  };
}

async function findMacAppExecutablePath(
  mountPath: string,
): Promise<string> {
  const { stdout: findOutput, error } = await runCommand(
    `find '${mountPath}' -maxdepth 1 -type d -name "*.app"`,
  );
  if (error) {
    return die(`Failed to find executable path at mount path ${mountPath}\n${error}`);
  }
  const appFolder = findOutput.trim();
  const appName = appFolder.split('/').pop().replace('.app', '');
  const appPath = `${appFolder}/Contents/MacOS/${appName}`;
  if (await exists(appPath)) {
    log(`Application is located at ${appPath}`);
  } else {
    return die(`Application does not exist at ${appPath}`);
  }
  return appPath;
}

async function detachMount(
  mountPath: string,
  retries = 5,
) {
  const { error } = await runCommand(`hdiutil detach '${mountPath}'`);
  if (error) {
    if (retries <= 0) {
      log(`Failed to detach mount after multiple attempts: ${mountPath}\n${error}`, LogLevel.Warn);
      return;
    }
    await sleep(500);
    await detachMount(mountPath, retries - 1);
    return;
  }
  log(`Successfully detached from ${mountPath}`);
}
