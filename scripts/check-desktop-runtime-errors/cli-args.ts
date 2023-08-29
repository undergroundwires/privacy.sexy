import { log } from './utils/log';

const PROCESS_ARGUMENTS: string[] = process.argv.slice(2);

export enum CommandLineFlag {
  ForceRebuild,
  TakeScreenshot,
}

export const COMMAND_LINE_FLAGS = Object.freeze({
  [CommandLineFlag.ForceRebuild]: '--build',
  [CommandLineFlag.TakeScreenshot]: '--screenshot',
});

export function logCurrentArgs(): void {
  if (!PROCESS_ARGUMENTS.length) {
    log('No additional arguments provided.');
    return;
  }
  log(`Arguments: ${PROCESS_ARGUMENTS.join(', ')}`);
}

export function hasCommandLineFlag(flag: CommandLineFlag): boolean {
  return PROCESS_ARGUMENTS.includes(COMMAND_LINE_FLAGS[flag]);
}
