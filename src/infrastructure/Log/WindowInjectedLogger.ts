import { Logger } from '@/application/Common/Log/Logger';
import { WindowVariables } from '../WindowVariables/WindowVariables';

export class WindowInjectedLogger implements Logger {
  private readonly logger: Logger;

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

  public warn(...params: unknown[]): void {
    this.logger.warn(...params);
  }

  public debug(...params: unknown[]): void {
    this.logger.debug(...params);
  }

  public error(...params: unknown[]): void {
    this.logger.error(...params);
  }
}
