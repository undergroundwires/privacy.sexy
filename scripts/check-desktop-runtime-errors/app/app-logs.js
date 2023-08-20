import { unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { log, die, LOG_LEVELS } from '../utils/log.js';
import { exists } from '../utils/io.js';
import { SUPPORTED_PLATFORMS, CURRENT_PLATFORM } from '../utils/platform.js';
import { getAppName } from '../utils/npm.js';

export async function clearAppLogFile(projectDir) {
  if (!projectDir) { throw new Error('missing project directory'); }
  const logPath = await determineLogPath(projectDir);
  if (!logPath || !await exists(logPath)) {
    log(`Skipping clearing logs, log file does not exist: ${logPath}.`);
    return;
  }
  try {
    await unlink(logPath);
    log(`Successfully cleared the log file at: ${logPath}.`);
  } catch (error) {
    die(`Failed to clear the log file at: ${logPath}. Reason: ${error}`);
  }
}

export async function readAppLogFile(projectDir) {
  if (!projectDir) { throw new Error('missing project directory'); }
  const logPath = await determineLogPath(projectDir);
  if (!logPath || !await exists(logPath)) {
    log(`No log file at: ${logPath}`, LOG_LEVELS.WARN);
    return undefined;
  }
  const logContent = await readLogFile(logPath);
  return logContent;
}

async function determineLogPath(projectDir) {
  if (!projectDir) { throw new Error('missing project directory'); }
  const appName = await getAppName(projectDir);
  if (!appName) {
    die('App name not found.');
  }
  const logFilePaths = {
    [SUPPORTED_PLATFORMS.MAC]: () => join(process.env.HOME, 'Library', 'Logs', appName, 'main.log'),
    [SUPPORTED_PLATFORMS.LINUX]: () => join(process.env.HOME, '.config', appName, 'logs', 'main.log'),
    [SUPPORTED_PLATFORMS.WINDOWS]: () => join(process.env.USERPROFILE, 'AppData', 'Roaming', appName, 'logs', 'main.log'),
  };
  const logFilePath = logFilePaths[CURRENT_PLATFORM]?.();
  if (!logFilePath) {
    log(`Cannot determine log path, unsupported OS: ${CURRENT_PLATFORM}`, LOG_LEVELS.WARN);
  }
  return logFilePath;
}

async function readLogFile(logFilePath) {
  const content = await readFile(logFilePath, 'utf-8');
  return content?.trim().length > 0 ? content : undefined;
}
