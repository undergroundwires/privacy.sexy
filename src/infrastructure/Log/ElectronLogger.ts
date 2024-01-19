import log from 'electron-log/main';
import { Logger } from '@/application/Common/Log/Logger';
import type { LogFunctions } from 'electron-log';

export function createElectronLogger(logger: LogFunctions = log): Logger {
  return logger;
}

export const ElectronLogger = createElectronLogger();
