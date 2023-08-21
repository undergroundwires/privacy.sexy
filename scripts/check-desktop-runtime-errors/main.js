import { logCurrentArgs, COMMAND_LINE_FLAGS, hasCommandLineFlag } from './cli-args.js';
import { log, die } from './utils/log.js';
import { ensureNpmProjectDir, npmInstall, npmBuild } from './utils/npm.js';
import { clearAppLogFile } from './app/app-logs.js';
import { checkForErrors } from './app/check-for-errors.js';
import { runApplication } from './app/runner.js';
import { CURRENT_PLATFORM, SUPPORTED_PLATFORMS } from './utils/platform.js';
import { prepareLinuxApp } from './app/extractors/linux.js';
import { prepareWindowsApp } from './app/extractors/windows.js';
import { prepareMacOsApp } from './app/extractors/macos.js';
import {
  DESKTOP_BUILD_COMMAND,
  PROJECT_DIR,
  DESKTOP_DIST_PATH,
  APP_EXECUTION_DURATION_IN_SECONDS,
  SCREENSHOT_PATH,
} from './config.js';

export async function main() {
  logCurrentArgs();
  await ensureNpmProjectDir(PROJECT_DIR);
  await npmInstall(PROJECT_DIR);
  await npmBuild(
    PROJECT_DIR,
    DESKTOP_BUILD_COMMAND,
    DESKTOP_DIST_PATH,
    hasCommandLineFlag(COMMAND_LINE_FLAGS.FORCE_REBUILD),
  );
  await clearAppLogFile(PROJECT_DIR);
  const {
    stderr, stdout, isCrashed, windowTitles,
  } = await extractAndRun();
  if (stdout) {
    log(`Output (stdout) from application execution:\n${stdout}`);
  }
  if (isCrashed) {
    die('The application encountered an error during its execution.');
  }
  await checkForErrors(stderr, windowTitles, PROJECT_DIR);
  log('🥳🎈 Success! Application completed without any runtime errors.');
  process.exit(0);
}

async function extractAndRun() {
  const extractors = {
    [SUPPORTED_PLATFORMS.MAC]: () => prepareMacOsApp(DESKTOP_DIST_PATH),
    [SUPPORTED_PLATFORMS.LINUX]: () => prepareLinuxApp(DESKTOP_DIST_PATH),
    [SUPPORTED_PLATFORMS.WINDOWS]: () => prepareWindowsApp(DESKTOP_DIST_PATH),
  };
  const extractor = extractors[CURRENT_PLATFORM];
  if (!extractor) {
    throw new Error(`Platform not supported: ${CURRENT_PLATFORM}`);
  }
  const { appExecutablePath, cleanup } = await extractor();
  try {
    return await runApplication(
      appExecutablePath,
      APP_EXECUTION_DURATION_IN_SECONDS,
      hasCommandLineFlag(COMMAND_LINE_FLAGS.TAKE_SCREENSHOT),
      SCREENSHOT_PATH,
    );
  } finally {
    if (cleanup) {
      log('Cleaning up post-execution resources...');
      await cleanup();
    }
  }
}
