import { ILogger } from '@/infrastructure/Log/ILogger';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class LoggerStub extends StubWithObservableMethodCalls<ILogger> implements ILogger {
  public info(...params: unknown[]): void {
    this.registerMethodCall({
      methodName: 'info',
      args: params,
    });
    console.log(...params);
  }
}
