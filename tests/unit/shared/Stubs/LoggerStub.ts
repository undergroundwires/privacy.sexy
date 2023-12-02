import { Logger } from '@/application/Common/Log/Logger';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class LoggerStub extends StubWithObservableMethodCalls<Logger> implements Logger {
  public warn(...params: unknown[]): void {
    this.registerMethodCall({
      methodName: 'warn',
      args: params,
    });
  }

  public error(...params: unknown[]): void {
    this.registerMethodCall({
      methodName: 'error',
      args: params,
    });
  }

  public debug(...params: unknown[]): void {
    this.registerMethodCall({
      methodName: 'debug',
      args: params,
    });
  }

  public info(...params: unknown[]): void {
    this.registerMethodCall({
      methodName: 'info',
      args: params,
    });
  }
}
