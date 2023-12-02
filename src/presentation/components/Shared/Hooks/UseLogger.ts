import { LoggerFactory } from '@/application/Common/Log/LoggerFactory';
import { ClientLoggerFactory } from '@/presentation/bootstrapping/ClientLoggerFactory';

export function useLogger(factory: LoggerFactory = ClientLoggerFactory.Current) {
  return {
    log: factory.logger,
  };
}
