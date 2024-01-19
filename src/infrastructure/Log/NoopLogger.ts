import { Logger } from '@/application/Common/Log/Logger';

export class NoopLogger implements Logger {
  public info(): void { /* NOOP */ }

  public warn(): void { /* NOOP */ }

  public error(): void { /* NOOP */ }

  public debug(): void { /* NOOP */ }
}
