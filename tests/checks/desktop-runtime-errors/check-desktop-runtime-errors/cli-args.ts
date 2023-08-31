import { log } from './utils/log';

export enum CommandLineFlag {
  ForceRebuild,
  TakeScreenshot,
}

export const COMMAND_LINE_FLAGS: {
  readonly [key in CommandLineFlag]: string;
} = Object.freeze({
  [CommandLineFlag.ForceRebuild]: '--build',
  [CommandLineFlag.TakeScreenshot]: '--screenshot',
});

export function logCurrentArgs(): void {
  const processArguments = getProcessArguments();
  if (!processArguments.length) {
    log('No additional arguments provided.');
    return;
  }
  log(`Arguments: ${processArguments.join(', ')}`);
}

export function hasCommandLineFlag(flag: CommandLineFlag): boolean {
  return getProcessArguments()
    .includes(COMMAND_LINE_FLAGS[flag]);
}

/*
  Fetches process arguments dynamically each time the function is called.
  This design allows for runtime modifications to process.argv, supporting scenarios
  where the command-line arguments might be altered dynamically.
*/
function getProcessArguments(): string[] {
  return process.argv.slice(2);
}
