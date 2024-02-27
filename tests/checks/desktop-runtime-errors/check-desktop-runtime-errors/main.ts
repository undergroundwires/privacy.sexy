import { logCurrentArgs, CommandLineFlag, hasCommandLineFlag } from './cli-args';
import { log, die } from './utils/log';
import { ensureNpmProjectDir, npmInstall, npmBuild } from './utils/npm';
import { clearAppLogFiles } from './app/app-logs';
import { checkForErrors } from './app/check-for-errors';
import { runApplication } from './app/runner.js';
import { CURRENT_PLATFORM, SupportedPlatform } from './utils/platform';
import { prepareLinuxApp } from './app/extractors/linux';
import { prepareWindowsApp } from './app/extractors/windows.js';
import { prepareMacOsApp } from './app/extractors/macos';
import {
  DESKTOP_BUILD_COMMAND,
  PROJECT_DIR,
  DESKTOP_DIST_PATH,
  APP_EXECUTION_DURATION_IN_SECONDS,
  SCREENSHOT_PATH,
} from './config';
import { indentText } from './utils/text';
import type { ExtractionResult } from './app/extractors/common/extraction-result';

export async function main(): Promise<void> {
  logCurrentArgs();
  await ensureNpmProjectDir(PROJECT_DIR);
  await npmInstall(PROJECT_DIR);
  await npmBuild(
    PROJECT_DIR,
    DESKTOP_BUILD_COMMAND,
    DESKTOP_DIST_PATH,
    hasCommandLineFlag(CommandLineFlag.ForceRebuild),
  );
  await clearAppLogFiles(PROJECT_DIR);
  const {
    stderr, stdout, isCrashed, windowTitles,
  } = await extractAndRun();
  if (stdout) {
    log(`Output (stdout) from application execution:\n${indentText(stdout, 1)}`);
  }
  if (isCrashed) {
    die('The application encountered an error during its execution.');
  }
  await checkForErrors(stderr, windowTitles, PROJECT_DIR);
  log('🥳🎈 Success! Application completed without any runtime errors.');
  process.exit(0);
}

async function extractAndRun() {
  const extractors: {
    readonly [K in SupportedPlatform]: () => Promise<ExtractionResult>;
  } = {
    [SupportedPlatform.macOS]: () => prepareMacOsApp(DESKTOP_DIST_PATH, PROJECT_DIR),
    [SupportedPlatform.Linux]: () => prepareLinuxApp(DESKTOP_DIST_PATH, PROJECT_DIR),
    [SupportedPlatform.Windows]: () => prepareWindowsApp(DESKTOP_DIST_PATH, PROJECT_DIR),
  };
  const extractor = extractors[CURRENT_PLATFORM];
  if (!extractor) {
    throw new Error(`Platform not supported: ${SupportedPlatform[CURRENT_PLATFORM]}`);
  }
  const { appExecutablePath, cleanup } = await extractor();
  try {
    return await runApplication(
      appExecutablePath,
      APP_EXECUTION_DURATION_IN_SECONDS,
      hasCommandLineFlag(CommandLineFlag.TakeScreenshot),
      SCREENSHOT_PATH,
    );
  } finally {
    if (cleanup) {
      log('Cleaning up post-execution resources...');
      await cleanup();
    }
  }
}
