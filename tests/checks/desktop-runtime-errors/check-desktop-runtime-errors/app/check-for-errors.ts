import { splitTextIntoLines, indentText } from '../utils/text';
import { log, die } from '../utils/log';
import { readAppLogFile } from './app-logs';
import { STDERR_IGNORE_PATTERNS } from './error-ignore-patterns';

const ELECTRON_CRASH_TITLE = 'Error'; // Used by electron for early crashes
const LOG_ERROR_MARKER = '[error]'; // from electron-log
const EXPECTED_LOG_MARKERS = [
  '[WINDOW_INIT]',
  '[PRELOAD_INIT]',
  '[APP_INIT]',
];

export async function checkForErrors(
  stderr: string,
  windowTitles: readonly string[],
  projectDir: string,
) {
  if (!projectDir) { throw new Error('missing project directory'); }
  const errors = await gatherErrors(stderr, windowTitles, projectDir);
  if (errors.length) {
    die(formatErrors(errors));
  }
}

async function gatherErrors(
  stderr: string,
  windowTitles: readonly string[],
  projectDir: string,
): Promise<ExecutionError[]> {
  if (!projectDir) { throw new Error('missing project directory'); }
  const { logFileContent: mainLogs, logFilePath: mainLogFile } = await readAppLogFile(projectDir);
  const allLogs = [mainLogs, stderr].filter(Boolean).join('\n');
  return [
    verifyStdErr(stderr),
    verifyApplicationLogsExist(mainLogs, mainLogFile),
    ...EXPECTED_LOG_MARKERS.map(
      (marker) => verifyLogMarkerExistsInLogs(allLogs, marker),
    ),
    verifyWindowTitle(windowTitles),
    verifyErrorsInLogs(allLogs),
  ].filter((error): error is ExecutionError => Boolean(error));
}

interface ExecutionError {
  readonly reason: string;
  readonly description: string;
}

function formatErrors(errors: readonly ExecutionError[]): string {
  if (!errors?.length) { throw new Error('missing errors'); }
  return [
    'Errors detected during execution:',
    ...errors.map(
      (error) => formatError(error),
    ),
  ].join('\n---\n');
}

function formatError(error: ExecutionError): string {
  if (!error) { throw new Error('missing error'); }
  if (!error.reason) { throw new Error(`missing reason, error (${typeof error}): ${JSON.stringify(error)}`); }
  let message = `Reason: ${indentText(error.reason, 1)}`;
  if (error.description) {
    message += `\nDescription:\n${indentText(error.description, 2)}`;
  }
  return message;
}

function verifyApplicationLogsExist(
  logContent: string | undefined,
  logFilePath: string,
): ExecutionError | undefined {
  if (!logContent?.length) {
    return describeError(
      'Missing application logs',
      'Application logs are empty not were not found.'
        + `\nLog path: ${logFilePath}`,
    );
  }
  return undefined;
}

function verifyLogMarkerExistsInLogs(
  logContent: string | undefined,
  marker: string,
) : ExecutionError | undefined {
  if (!marker) {
    throw new Error('missing marker');
  }
  if (!logContent?.includes(marker)) {
    return describeError(
      'Incomplete application logs',
      `Missing identifier "${marker}" in application logs.`,
    );
  }
  return undefined;
}

function verifyWindowTitle(
  windowTitles: readonly string[],
) : ExecutionError | undefined {
  const errorTitles = windowTitles.filter(
    (title) => title.toLowerCase().includes(ELECTRON_CRASH_TITLE),
  );
  if (errorTitles.length) {
    return describeError(
      'Unexpected window title',
      'One or more window titles suggest an error occurred in the application:'
        + `\nError Titles: ${errorTitles.join(', ')}`
        + `\nAll Titles: ${windowTitles.join(', ')}`,
    );
  }
  return undefined;
}

function verifyStdErr(
  stderrOutput: string | undefined,
) : ExecutionError | undefined {
  if (stderrOutput && stderrOutput.length > 0) {
    const ignoredErrorLines = new Set();
    const relevantErrors = getNonEmptyLines(stderrOutput)
      .filter((line) => {
        line = line.trim();
        if (STDERR_IGNORE_PATTERNS.some((pattern) => pattern.test(line))) {
          ignoredErrorLines.add(line);
          return false;
        }
        return true;
      });
    if (ignoredErrorLines.size > 0) {
      log(`Ignoring \`stderr\` lines:\n${indentText([...ignoredErrorLines].join('\n'), 1)}`);
    }
    if (relevantErrors.length === 0) {
      return undefined;
    }
    return describeError(
      'Standard error stream (`stderr`) is not empty.',
      `Relevant errors (${relevantErrors.length}):\n${indentText(relevantErrors.map((error) => `- ${error}`).join('\n'), 1)}`
      + `\nFull \`stderr\` output:\n${indentText(stderrOutput, 1)}`,
    );
  }
  return undefined;
}

function verifyErrorsInLogs(
  logContent: string | undefined,
) : ExecutionError | undefined {
  if (!logContent?.length) {
    return undefined;
  }
  const logLines = getNonEmptyLines(logContent)
    .filter((line) => line.includes(LOG_ERROR_MARKER));
  if (!logLines.length) {
    return undefined;
  }
  return describeError(
    'Application log file',
    logLines.join('\n'),
  );
}

function describeError(
  reason: string,
  description: string,
) : ExecutionError | undefined {
  return {
    reason,
    description: `${description}\n\nThis might indicate an early crash or significant runtime issue.`,
  };
}

function getNonEmptyLines(text: string) {
  return splitTextIntoLines(text)
    .filter((line) => line?.trim().length > 0);
}
