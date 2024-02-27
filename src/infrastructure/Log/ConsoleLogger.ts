import type { Logger } from '@/application/Common/Log/Logger';

export class ConsoleLogger implements Logger {
  constructor(private readonly consoleProxy: ConsoleLogFunctions = globalThis.console) {
    if (!consoleProxy) { // do not trust strictNullChecks for global objects
      throw new Error('missing console');
    }
  }

  public info(...params: unknown[]): void {
    this.consoleProxy.info(...params);
  }

  public warn(...params: unknown[]): void {
    this.consoleProxy.warn(...params);
  }

  public error(...params: unknown[]): void {
    this.consoleProxy.error(...params);
  }

  public debug(...params: unknown[]): void {
    this.consoleProxy.debug(...params);
  }
}

interface ConsoleLogFunctions extends Partial<Console> {
  readonly info: Console['info'];
  readonly warn: Console['warn'];
  readonly error: Console['error'];
  readonly debug: Console['debug'];
}
