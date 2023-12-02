import log from 'electron-log/main';
import { Logger } from '@/application/Common/Log/Logger';
import type { LogFunctions } from 'electron-log';

// Using plain-function rather than class so it can be used in Electron's context-bridging.
export function createElectronLogger(logger: LogFunctions = log): Logger {
  return {
    info: (...params) => logger.info(...params),
    debug: (...params) => logger.debug(...params),
    warn: (...params) => logger.warn(...params),
    error: (...params) => logger.error(...params),
  };
}

export const ElectronLogger = createElectronLogger();
