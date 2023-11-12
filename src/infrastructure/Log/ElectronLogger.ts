import { ElectronLog } from 'electron-log';
import { ILogger } from './ILogger';

// Using plain-function rather than class so it can be used in Electron's context-bridging.
export function createElectronLogger(logger: Partial<ElectronLog>): ILogger {
  if (!logger) {
    throw new Error('missing logger');
  }
  return {
    info: (...params) => {
      if (!logger.info) {
        throw new Error('missing "info" function');
      }
      logger.info(...params);
    },
  };
}
