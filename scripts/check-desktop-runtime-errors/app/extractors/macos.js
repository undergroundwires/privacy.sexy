import { runCommand } from '../../utils/run-command.js';
import { findSingleFileByExtension, exists } from '../../utils/io.js';
import { log, die, LOG_LEVELS } from '../../utils/log.js';

export async function prepareMacOsApp(desktopDistPath) {
  const { absolutePath: dmgPath } = await findSingleFileByExtension('dmg', desktopDistPath);
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

async function mountDmg(dmgFile) {
  const { stdout: hdiutilOutput, error } = await runCommand(`hdiutil attach '${dmgFile}'`);
  if (error) {
    die(`Failed to mount DMG file at ${dmgFile}.\n${error}`);
  }
  const mountPathMatch = hdiutilOutput.match(/\/Volumes\/[^\n]+/);
  const mountPath = mountPathMatch ? mountPathMatch[0] : null;
  return {
    mountPath,
  };
}

async function findMacAppExecutablePath(mountPath) {
  const { stdout: findOutput, error } = await runCommand(
    `find '${mountPath}' -maxdepth 1 -type d -name "*.app"`,
  );
  if (error) {
    die(`Failed to find executable path at mount path ${mountPath}\n${error}`);
  }
  const appFolder = findOutput.trim();
  const appName = appFolder.split('/').pop().replace('.app', '');
  const appPath = `${appFolder}/Contents/MacOS/${appName}`;
  if (await exists(appPath)) {
    log(`Application is located at ${appPath}`);
  } else {
    die(`Application does not exist at ${appPath}`);
  }
  return appPath;
}

async function detachMount(mountPath, retries = 5) {
  const { error } = await runCommand(`hdiutil detach '${mountPath}'`);
  if (error) {
    if (retries <= 0) {
      log(`Failed to detach mount after multiple attempts: ${mountPath}\n${error}`, LOG_LEVELS.WARN);
      return;
    }
    await sleep(500);
    await detachMount(mountPath, retries - 1);
    return;
  }
  log(`Successfully detached from ${mountPath}`);
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
