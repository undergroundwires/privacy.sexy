import { ILogger } from './ILogger';

export class ConsoleLogger implements ILogger {
  constructor(private readonly consoleProxy: Partial<Console> = console) {
    if (!consoleProxy) { // do not trust strictNullChecks for global objects
      throw new Error('missing console');
    }
  }

  public info(...params: unknown[]): void {
    const logFunction = this.consoleProxy?.info;
    if (!logFunction) {
      throw new Error('missing "info" function');
    }
    logFunction.call(this.consoleProxy, ...params);
  }
}
