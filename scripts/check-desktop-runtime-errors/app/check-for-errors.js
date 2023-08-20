import { splitTextIntoLines, indentText } from '../utils/text.js';
import { die } from '../utils/log.js';
import { readAppLogFile } from './app-logs.js';

const LOG_ERROR_MARKER = '[error]'; // from electron-log
const ELECTRON_CRASH_TITLE = 'Error'; // Used by electron for early crashes
const APP_INITIALIZED_MARKER = '[APP_INIT_SUCCESS]'; // Logged by application on successful initialization

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
    verifyApplicationInitializationLog(logContent),
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

function verifyApplicationInitializationLog(logContent) {
  if (!logContent || !logContent.length) {
    return describeError(
      'Missing application logs',
      'Application logs are empty not were not found.',
    );
  }
  if (!logContent.includes(APP_INITIALIZED_MARKER)) {
    return describeError(
      'Unexpected application logs',
      `Missing identifier "${APP_INITIALIZED_MARKER}" in application logs.`,
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
    description: `${description}\nThis might indicate an early crash or significant runtime issue.`,
  };
}

function getNonEmptyLines(text) {
  return splitTextIntoLines(text)
    .filter((line) => line?.trim().length > 0);
}
