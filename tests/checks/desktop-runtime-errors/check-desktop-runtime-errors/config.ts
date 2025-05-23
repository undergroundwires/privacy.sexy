import { join } from 'node:path';
import distDirs from '@/../dist-dirs.json' with { type: 'json' };

export const DESKTOP_BUILD_COMMAND = [
  'npm run electron:prebuild',
  'npm run check:verify-build-artifacts -- --electron-unbundled',
  'npm run electron:build -- --publish never',
  'npm run check:verify-build-artifacts -- --electron-bundled',
].join(' && ');
export const PROJECT_DIR = process.cwd();
export const DESKTOP_DIST_PATH = join(PROJECT_DIR, distDirs.electronBundled);
export const APP_EXECUTION_DURATION_IN_SECONDS = 10 /* minutes */ * 60; // Long enough for CI agents
export const SCREENSHOT_PATH = join(PROJECT_DIR, 'screenshot.png');
