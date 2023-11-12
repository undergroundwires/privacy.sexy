import { WindowVariables } from '../WindowVariables/WindowVariables';
import { ILogger } from './ILogger';

export class WindowInjectedLogger implements ILogger {
  private readonly logger: ILogger;

  constructor(windowVariables: WindowVariables | undefined | null = window) {
    if (!windowVariables) { // do not trust strict null checks for global objects
      throw new Error('missing window');
    }
    if (!windowVariables.log) {
      throw new Error('missing log');
    }
    this.logger = windowVariables.log;
  }

  public info(...params: unknown[]): void {
    this.logger.info(...params);
  }
}
