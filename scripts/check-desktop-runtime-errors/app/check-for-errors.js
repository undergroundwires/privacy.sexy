import { splitTextIntoLines, indentText } from '../utils/text.js';
import { die } from '../utils/log.js';
import { readAppLogFile } from './app-logs.js';

const ELECTRON_CRASH_TITLE = 'Error'; // Used by electron for early crashes
const LOG_ERROR_MARKER = '[error]'; // from electron-log
const EXPECTED_LOG_MARKERS = [
  '[WINDOW_INIT]',
  '[PRELOAD_INIT]',
  '[APP_MOUNT_INIT]',
];

export async function checkForErrors(stderr, windowTitles, projectDir) {
  if (!projectDir) { throw new Error('missing project directory'); }
  const errors = await gatherErrors(stderr, windowTitles, projectDir);
  if (errors.length) {
    die(formatErrors(errors));
  }
}

async function gatherErrors(stderr, windowTitles, projectDir) {
  if (!projectDir) { throw new Error('missing project directory'); }
  const logContent = await readAppLogFile(projectDir);
  return [
    verifyStdErr(stderr),
    verifyApplicationLogsExist(logContent),
    ...EXPECTED_LOG_MARKERS.map((marker) => verifyLogMarkerExistsInLogs(logContent, marker)),
    verifyWindowTitle(windowTitles),
    verifyErrorsInLogs(logContent),
  ].filter(Boolean);
}

function formatErrors(errors) {
  if (!errors || !errors.length) { throw new Error('missing errors'); }
  return [
    'Errors detected during execution:',
    ...errors.map(
      (error) => formatError(error),
    ),
  ].join('\n---\n');
}

function formatError(error) {
  if (!error) { throw new Error('missing error'); }
  if (!error.reason) { throw new Error(`missing reason, error (${typeof error}): ${JSON.stringify(error)}`); }
  let message = `Reason: ${indentText(error.reason, 1)}`;
  if (error.description) {
    message += `\nDescription:\n${indentText(error.description, 2)}`;
  }
  return message;
}

function verifyApplicationLogsExist(logContent) {
  if (!logContent || !logContent.length) {
    return describeError(
      'Missing application logs',
      'Application logs are empty not were not found.',
    );
  }
  return undefined;
}

function verifyLogMarkerExistsInLogs(logContent, marker) {
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

function verifyWindowTitle(windowTitles) {
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

function verifyStdErr(stderrOutput) {
  if (stderrOutput && stderrOutput.length > 0) {
    return describeError(
      'Standard error stream (`stderr`) is not empty.',
      stderrOutput,
    );
  }
  return undefined;
}

function verifyErrorsInLogs(logContent) {
  if (!logContent || !logContent.length) {
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

function describeError(reason, description) {
  return {
    reason,
    description: `${description}\n\nThis might indicate an early crash or significant runtime issue.`,
  };
}

function getNonEmptyLines(text) {
  return splitTextIntoLines(text)
    .filter((line) => line?.trim().length > 0);
}
