import { join } from 'path';

export const DESKTOP_BUILD_COMMAND = 'npm run electron:build -- -p never';
export const PROJECT_DIR = process.cwd();
export const DESKTOP_DIST_PATH = join(PROJECT_DIR, 'dist_electron');
export const APP_EXECUTION_DURATION_IN_SECONDS = 60; // Long enough for CI runners
export const SCREENSHOT_PATH = join(PROJECT_DIR, 'screenshot.png');
