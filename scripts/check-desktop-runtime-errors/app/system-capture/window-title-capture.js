import { runCommand } from '../../utils/run-command.js';
import { log, LOG_LEVELS } from '../../utils/log.js';
import { SUPPORTED_PLATFORMS, CURRENT_PLATFORM } from '../../utils/platform.js';

export async function captureWindowTitles(processId) {
  if (!processId) { throw new Error('Missing process ID.'); }

  const captureFunction = windowTitleCaptureFunctions[CURRENT_PLATFORM];
  if (!captureFunction) {
    log(`Cannot capture window title, unsupported OS: ${CURRENT_PLATFORM}`, LOG_LEVELS.WARN);
    return undefined;
  }

  return captureFunction(processId);
}

const windowTitleCaptureFunctions = {
  [SUPPORTED_PLATFORMS.MAC]: captureTitlesOnMac,
  [SUPPORTED_PLATFORMS.LINUX]: captureTitlesOnLinux,
  [SUPPORTED_PLATFORMS.WINDOWS]: captureTitlesOnWindows,
};

async function captureTitlesOnWindows(processId) {
  if (!processId) { throw new Error('Missing process ID.'); }

  const { stdout: tasklistOutput, error } = await runCommand(
    `tasklist /FI "PID eq ${processId}" /fo list /v`,
  );
  if (error) {
    log(`Failed to retrieve window title.\n${error}`, LOG_LEVELS.WARN);
    return [];
  }
  const match = tasklistOutput.match(/Window Title:\s*(.*)/);
  if (match && match[1]) {
    const title = match[1].trim();
    if (title === 'N/A') {
      return [];
    }
    return [title];
  }
  return [];
}

async function captureTitlesOnLinux(processId) {
  if (!processId) { throw new Error('Missing process ID.'); }

  const { stdout: windowIdsOutput, error: windowIdError } = await runCommand(
    `xdotool search --pid '${processId}'`,
  );

  if (windowIdError || !windowIdsOutput) {
    return undefined;
  }

  const windowIds = windowIdsOutput.trim().split('\n');

  const titles = await Promise.all(windowIds.map(async (windowId) => {
    const { stdout: titleOutput, error: titleError } = await runCommand(
      `xprop -id ${windowId} | grep "WM_NAME(STRING)" | cut -d '=' -f 2 | sed 's/^[[:space:]]*"\\(.*\\)"[[:space:]]*$/\\1/'`
    );
    if (titleError || !titleOutput) {
      return undefined;
    }
    return titleOutput.trim();
  }));

  return titles.filter(Boolean);
}

let hasAssistiveAccessOnMac = true;

async function captureTitlesOnMac(processId) {
  if (!processId) { throw new Error('Missing process ID.'); }
  if (!hasAssistiveAccessOnMac) {
    return [];
  }
  const script = `
      tell application "System Events"
      try
        set targetProcess to first process whose unix id is ${processId}
      on error
        return
      end try
      tell targetProcess
        if (count of windows) > 0 then
          set window_name to name of front window
          return window_name
        end if
      end tell
    end tell
  `;
  const argument = script.trim()
    .split(/[\r\n]+/)
    .map((line) => `-e '${line.trim()}'`)
    .join(' ');

  const { stdout: titleOutput, error } = await runCommand(`osascript ${argument}`);
  if (error) {
    let errorMessage = '';
    if (error.includes('-25211')) {
      errorMessage += 'Capturing window title requires assistive access. You do not have it.\n';
      hasAssistiveAccessOnMac = false;
    }
    errorMessage += error;
    log(errorMessage, LOG_LEVELS.WARN);
    return [];
  }
  const title = titleOutput?.trim();
  if (!title) {
    return [];
  }
  return [title];
}
