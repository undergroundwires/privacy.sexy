import { spawn, type ChildProcess } from 'node:child_process';
import { log, LogLevel, die } from '../utils/log';
import { captureScreen } from './system-capture/screen-capture';
import { captureWindowTitles } from './system-capture/window-title-capture';

const TERMINATION_GRACE_PERIOD_IN_SECONDS = 20;
const TERMINATION_CHECK_INTERVAL_IN_MS = 1000;
const WINDOW_TITLE_CAPTURE_INTERVAL_IN_MS = 100;

export function runApplication(
  appFile: string,
  executionDurationInSeconds: number,
  enableScreenshot: boolean,
  screenshotPath: string,
): Promise<ApplicationExecutionResult> {
  if (!appFile) {
    throw new Error('Missing app file');
  }

  logDetails(appFile, executionDurationInSeconds);

  const process = spawn(appFile);
  const processDetails: ApplicationProcessDetails = {
    stderrData: '',
    stdoutData: '',
    explicitlyKilled: false,
    windowTitles: [],
    isCrashed: false,
    isDone: false,
    process,
    resolve: () => { /* NOOP */ },
  };

  return new Promise((resolve) => {
    processDetails.resolve = resolve;
    if (process.pid === undefined) {
      throw new Error('Unknown PID');
    }
    beginCapturingTitles(process.pid, processDetails);
    handleProcessEvents(
      processDetails,
      enableScreenshot,
      screenshotPath,
      executionDurationInSeconds,
    );
  });
}

interface ApplicationExecutionResult {
  readonly stderr: string,
  readonly stdout: string,
  readonly windowTitles: readonly string[],
  readonly isCrashed: boolean,
}

interface ApplicationProcessDetails {
  readonly process: ChildProcess;

  stderrData: string;
  stdoutData: string;
  explicitlyKilled: boolean;
  windowTitles: Array<string>;
  isCrashed: boolean;
  isDone: boolean;
  resolve: (value: ApplicationExecutionResult) => void;
}

function logDetails(
  appFile: string,
  executionDurationInSeconds: number,
): void {
  log(
    [
      'Executing the app to check for errors...',
      `Maximum execution time: ${executionDurationInSeconds}`,
      `Application path: ${appFile}`,
    ].join('\n\t'),
  );
}

function beginCapturingTitles(
  processId: number,
  processDetails: ApplicationProcessDetails,
): void {
  const capture = async () => {
    const titles = await captureWindowTitles(processId);

    (titles || []).forEach((title) => {
      if (!title) {
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
  processDetails: ApplicationProcessDetails,
  enableScreenshot: boolean,
  screenshotPath: string,
  executionDurationInSeconds: number,
): void {
  const { process } = processDetails;
  process.stderr?.on('data', (data) => {
    processDetails.stderrData += data.toString();
  });
  process.stdout?.on('data', (data) => {
    processDetails.stdoutData += data.toString();
  });

  process.on('error', (error) => {
    die(`An issue spawning the child process: ${error}`);
  });

  process.on('exit', async (code) => {
    await onProcessExit(code, processDetails, enableScreenshot, screenshotPath);
  });

  setTimeout(async () => {
    await onExecutionLimitReached(processDetails, enableScreenshot, screenshotPath);
  }, executionDurationInSeconds * 1000);
}

async function onProcessExit(
  code: number | null,
  processDetails: ApplicationProcessDetails,
  enableScreenshot: boolean,
  screenshotPath: string,
): Promise<void> {
  log(`Application exited ${code === null || Number.isNaN(code) ? '.' : `with code ${code}`}`);

  if (processDetails.explicitlyKilled) return;

  processDetails.isCrashed = true;

  if (enableScreenshot) {
    await captureScreen(screenshotPath);
  }

  finishProcess(processDetails);
}

async function onExecutionLimitReached(
  processDetails: ApplicationProcessDetails,
  enableScreenshot: boolean,
  screenshotPath: string,
): Promise<void> {
  if (enableScreenshot) {
    await captureScreen(screenshotPath);
  }

  processDetails.explicitlyKilled = true;
  await terminateGracefully(processDetails.process);
  finishProcess(processDetails);
}

function finishProcess(processDetails: ApplicationProcessDetails): void {
  processDetails.isDone = true;
  processDetails.resolve({
    stderr: processDetails.stderrData,
    stdout: processDetails.stdoutData,
    windowTitles: [...processDetails.windowTitles],
    isCrashed: processDetails.isCrashed,
  });
}

async function terminateGracefully(
  process: ChildProcess,
): Promise<void> {
  let elapsedSeconds = 0;
  log('Attempting to terminate the process gracefully...');
  process.kill('SIGTERM');

  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      elapsedSeconds += TERMINATION_CHECK_INTERVAL_IN_MS / 1000;

      if (elapsedSeconds >= TERMINATION_GRACE_PERIOD_IN_SECONDS) {
        process.kill('SIGKILL');
        log('Process did not terminate gracefully within the grace period. Forcing termination.', LogLevel.Warn);
        clearInterval(checkInterval);
        resolve();
      }
    }, TERMINATION_CHECK_INTERVAL_IN_MS);

    process.on('exit', () => {
      log('Process terminated gracefully.');
      clearInterval(checkInterval);
      resolve();
    });
  });
}
