import { ILogger } from './ILogger';

export class NoopLogger implements ILogger {
  public info(): void { /* NOOP */ }
}
