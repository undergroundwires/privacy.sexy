import { spawn } from 'child_process';
import { log, LOG_LEVELS, die } from '../utils/log.js';
import { captureScreen } from './system-capture/screen-capture.js';
import { captureWindowTitles } from './system-capture/window-title-capture.js';

const TERMINATION_GRACE_PERIOD_IN_SECONDS = 60;
const TERMINATION_CHECK_INTERVAL_IN_MS = 1000;
const WINDOW_TITLE_CAPTURE_INTERVAL_IN_MS = 100;

export function runApplication(
  appFile,
  executionDurationInSeconds,
  enableScreenshot,
  screenshotPath,
) {
  if (!appFile) {
    throw new Error('Missing app file');
  }

  logDetails(appFile, executionDurationInSeconds);

  const processDetails = {
    stderrData: '',
    stdoutData: '',
    explicitlyKilled: false,
    windowTitles: [],
    isCrashed: false,
    isDone: false,
    process: undefined,
    resolve: () => { /* NOOP */ },
  };

  const process = spawn(appFile);
  processDetails.process = process;

  return new Promise((resolve) => {
    processDetails.resolve = resolve;
    handleTitleCapture(process.pid, processDetails);
    handleProcessEvents(
      processDetails,
      enableScreenshot,
      screenshotPath,
      executionDurationInSeconds,
    );
  });
}

function logDetails(appFile, executionDurationInSeconds) {
  log(
    [
      'Executing the app to check for errors...',
      `Maximum execution time: ${executionDurationInSeconds}`,
      `Application path: ${appFile}`,
    ].join('\n\t'),
  );
}

function handleTitleCapture(processId, processDetails) {
  const capture = async () => {
    const titles = await captureWindowTitles(processId);

    (titles || []).forEach((title) => {
      if (!title || !title.length) {
        return;
      }
      if (!processDetails.windowTitles.includes(title)) {
        log(`New window title captured: ${title}`);
        processDetails.windowTitles.push(title);
      }
    });

    if (!processDetails.isDone) {
      setTimeout(capture, WINDOW_TITLE_CAPTURE_INTERVAL_IN_MS);
    }
  };

  capture();
}

function handleProcessEvents(
  processDetails,
  enableScreenshot,
  screenshotPath,
  executionDurationInSeconds,
) {
  const { process } = processDetails;
  process.stderr.on('data', (data) => {
    processDetails.stderrData += data.toString();
  });
  process.stdout.on('data', (data) => {
    processDetails.stdoutData += data.toString();
  });

  process.on('error', (error) => {
    die(`An issue spawning the child process: ${error}`, LOG_LEVELS.ERROR);
  });

  process.on('exit', async (code) => {
    await onProcessExit(code, processDetails, enableScreenshot, screenshotPath);
  });

  setTimeout(async () => {
    await onExecutionLimitReached(process, processDetails, enableScreenshot, screenshotPath);
  }, executionDurationInSeconds * 1000);
}

async function onProcessExit(code, processDetails, enableScreenshot, screenshotPath) {
  log(`Application exited ${code === null || Number.isNaN(code) ? '.' : `with code ${code}`}`);

  if (processDetails.explicitlyKilled) return;

  processDetails.isCrashed = true;

  if (enableScreenshot) {
    await captureScreen(screenshotPath);
  }

  finishProcess(processDetails);
}

async function onExecutionLimitReached(process, processDetails, enableScreenshot, screenshotPath) {
  if (enableScreenshot) {
    await captureScreen(screenshotPath);
  }

  processDetails.explicitlyKilled = true;
  await terminateGracefully(process);
  finishProcess(processDetails);
}

function finishProcess(processDetails) {
  processDetails.isDone = true;
  processDetails.resolve({
    stderr: processDetails.stderrData,
    stdout: processDetails.stdoutData,
    windowTitles: [...processDetails.windowTitles],
    isCrashed: processDetails.isCrashed,
  });
}

async function terminateGracefully(process) {
  let elapsedSeconds = 0;
  log('Attempting to terminate the process gracefully...');
  process.kill('SIGTERM');

  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      elapsedSeconds += TERMINATION_CHECK_INTERVAL_IN_MS / 1000;

      if (!process.killed) {
        if (elapsedSeconds >= TERMINATION_GRACE_PERIOD_IN_SECONDS) {
          process.kill('SIGKILL');
          log('Process did not terminate gracefully within the grace period. Forcing termination.', LOG_LEVELS.WARN);
          clearInterval(checkInterval);
          resolve();
        }
      } else {
        log('Process terminated gracefully.');
        clearInterval(checkInterval);
        resolve();
      }
    }, TERMINATION_CHECK_INTERVAL_IN_MS);
  });
}
