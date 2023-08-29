import { ILogger } from './ILogger';

export interface ILoggerFactory {
  readonly logger: ILogger;
}
