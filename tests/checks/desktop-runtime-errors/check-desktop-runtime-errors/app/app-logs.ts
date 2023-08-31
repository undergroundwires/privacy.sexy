import { unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { log, die, LogLevel } from '../utils/log';
import { exists } from '../utils/io';
import { SupportedPlatform, CURRENT_PLATFORM } from '../utils/platform';
import { getAppName } from '../utils/npm';

const LOG_FILE_NAMES = ['main', 'renderer'];

export async function clearAppLogFiles(
  projectDir: string,
): Promise<void> {
  if (!projectDir) { throw new Error('missing project directory'); }
  await Promise.all(LOG_FILE_NAMES.map(async (logFileName) => {
    const logPath = await determineLogPath(projectDir, logFileName);
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
  }));
}

export async function readAppLogFile(
  projectDir: string,
  logFileName: string,
): Promise<AppLogFileResult> {
  if (!projectDir) { throw new Error('missing project directory'); }
  const logPath = await determineLogPath(projectDir, logFileName);
  if (!logPath || !await exists(logPath)) {
    log(`No log file at: ${logPath}`, LogLevel.Warn);
    return {
      logFilePath: logPath,
    };
  }
  const logContent = await readLogFile(logPath);
  return {
    logFileContent: logContent,
    logFilePath: logPath,
  };
}

interface AppLogFileResult {
  readonly logFilePath: string;
  readonly logFileContent?: string;
}

async function determineLogPath(
  projectDir: string,
  logFileName: string,
): Promise<string> {
  if (!projectDir) { throw new Error('missing project directory'); }
  if (!LOG_FILE_NAMES.includes(logFileName)) { throw new Error(`unknown log file name: ${logFileName}`); }
  const appName = await getAppName(projectDir);
  if (!appName) {
    return die('App name not found.');
  }
  const logFilePaths: {
    readonly [K in SupportedPlatform]: () => string;
  } = {
    [SupportedPlatform.macOS]: () => join(process.env.HOME, 'Library', 'Logs', appName, `${logFileName}.log`),
    [SupportedPlatform.Linux]: () => join(process.env.HOME, '.config', appName, 'logs', `${logFileName}.log`),
    [SupportedPlatform.Windows]: () => join(process.env.USERPROFILE, 'AppData', 'Roaming', appName, 'logs', `${logFileName}.log`),
  };
  const logFilePath = logFilePaths[CURRENT_PLATFORM]?.();
  if (!logFilePath) {
    log(`Cannot determine log path, unsupported OS: ${SupportedPlatform[CURRENT_PLATFORM]}`, LogLevel.Warn);
  }
  return logFilePath;
}

async function readLogFile(
  logFilePath: string,
): Promise<string | undefined> {
  const content = await readFile(logFilePath, 'utf-8');
  return content?.trim().length > 0 ? content : undefined;
}
