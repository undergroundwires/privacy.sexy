import { splitTextIntoLines } from '@/application/Common/Text/SplitTextIntoLines';
import { filterEmptyStrings } from '@/application/Common/Text/FilterEmptyStrings';
import { runCommand } from '../../utils/run-command';
import { log, LogLevel } from '../../utils/log';
import { SupportedPlatform, CURRENT_PLATFORM } from '../../utils/platform';

export async function captureWindowTitles(processId: number) {
  if (!processId) { throw new Error('Missing process ID.'); }

  const captureFunction = windowTitleCaptureFunctions[CURRENT_PLATFORM];
  if (!captureFunction) {
    log(`Cannot capture window title, unsupported OS: ${SupportedPlatform[CURRENT_PLATFORM]}`, LogLevel.Warn);
    return undefined;
  }

  return captureFunction(processId);
}

const windowTitleCaptureFunctions: {
  readonly [K in SupportedPlatform]: (processId: number) => Promise<string[]>;
} = {
  [SupportedPlatform.macOS]: (processId) => captureTitlesOnMac(processId),
  [SupportedPlatform.Linux]: (processId) => captureTitlesOnLinux(processId),
  [SupportedPlatform.Windows]: (processId) => captureTitlesOnWindows(processId),
};

async function captureTitlesOnWindows(processId: number): Promise<string[]> {
  if (!processId) { throw new Error('Missing process ID.'); }

  const { stdout: tasklistOutput, error } = await runCommand(
    `tasklist /FI "PID eq ${processId}" /fo list /v`,
  );
  if (error) {
    log(`Failed to retrieve window title.\n${error}`, LogLevel.Warn);
    return [];
  }
  const regex = /Window Title:\s*(.*)/;
  const match = regex.exec(tasklistOutput);
  if (match && match.length > 1 && match[1]) {
    const title = match[1].trim();
    if (title === 'N/A') {
      return [];
    }
    return [title];
  }
  return [];
}

async function captureTitlesOnLinux(processId: number): Promise<string[]> {
  if (!processId) { throw new Error('Missing process ID.'); }

  const { stdout: windowIdsOutput, error: windowIdError } = await runCommand(
    `xdotool search --pid '${processId}'`,
  );

  if (windowIdError || !windowIdsOutput) {
    return [];
  }

  const windowIds = splitTextIntoLines(windowIdsOutput.trim());

  const titles = await Promise.all(windowIds.map(async (windowId) => {
    const { stdout: titleOutput, error: titleError } = await runCommand(
      `xprop -id ${windowId} | grep "WM_NAME(STRING)" | cut -d '=' -f 2 | sed 's/^[[:space:]]*"\\(.*\\)"[[:space:]]*$/\\1/'`,
    );
    if (titleError || !titleOutput) {
      return undefined;
    }
    return titleOutput.trim();
  }));

  return filterEmptyStrings(titles);
}

let hasAssistiveAccessOnMac = true;

async function captureTitlesOnMac(processId: number): Promise<string[]> {
  if (!processId) { throw new Error('Missing process ID.'); }
  if (!hasAssistiveAccessOnMac) {
    return [];
  }
  const command = constructAppleScriptCommand(`
    tell application "System Events"
      try
        set targetProcess to first process whose unix id is ${processId}
      on error
        return
      end try
      tell targetProcess
        set allWindowNames to {}
        repeat with aWindow in windows
          set end of allWindowNames to name of aWindow
        end repeat
        return allWindowNames
      end tell
    end tell
  `);
  const { stdout: titleOutput, error } = await runCommand(command);
  if (error) {
    let errorMessage = '';
    if (error.includes('-25211')) {
      errorMessage += 'Capturing window title requires assistive access. You do not have it.\n';
      hasAssistiveAccessOnMac = false;
    }
    errorMessage += error;
    log(errorMessage, LogLevel.Warn);
    return [];
  }
  const title = titleOutput?.trim();
  if (!title) {
    return [];
  }
  return [title];
}

function constructAppleScriptCommand(appleScriptCode: string): string {
  const scriptLines = splitTextIntoLines(appleScriptCode.trim());
  const trimmedLines = scriptLines.map((line) => line.trim());
  const nonEmptyLines = filterEmptyStrings(trimmedLines);
  const formattedArguments = nonEmptyLines
    .map((line) => `-e '${line.trim()}'`)
    .join(' ');
  return `osascript ${formattedArguments}`;
}
