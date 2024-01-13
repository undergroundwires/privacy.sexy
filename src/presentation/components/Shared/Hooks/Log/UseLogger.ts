import { ClientLoggerFactory } from './ClientLoggerFactory';
import { LoggerFactory } from './LoggerFactory';

export function useLogger(factory: LoggerFactory = ClientLoggerFactory.Current) {
  return {
    log: factory.logger,
  };
}
