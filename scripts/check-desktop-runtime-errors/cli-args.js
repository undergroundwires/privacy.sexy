import { log } from './utils/log.js';

const PROCESS_ARGUMENTS = process.argv.slice(2);

export const COMMAND_LINE_FLAGS = Object.freeze({
  FORCE_REBUILD: '--build',
  TAKE_SCREENSHOT: '--screenshot',
});

export function logCurrentArgs() {
  if (!PROCESS_ARGUMENTS.length) {
    log('No additional arguments provided.');
    return;
  }
  log(`Arguments: ${PROCESS_ARGUMENTS.join(', ')}`);
}

export function hasCommandLineFlag(flag) {
  return PROCESS_ARGUMENTS.includes(flag);
}
