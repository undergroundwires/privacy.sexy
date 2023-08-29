import { ILogger } from './ILogger';

export class ConsoleLogger implements ILogger {
  constructor(private readonly globalConsole: Partial<Console> = console) {
    if (!globalConsole) {
      throw new Error('missing console');
    }
  }

  public info(...params: unknown[]): void {
    this.globalConsole.info(...params);
  }
}
