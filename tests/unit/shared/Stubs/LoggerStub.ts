import { Logger } from '@/application/Common/Log/Logger';
import { FunctionKeys, isString } from '@/TypeHelpers';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
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

  public assertLogsContainMessagePart(
    methodName: FunctionKeys<Logger>,
    expectedLogMessagePart: string,
  ) {
    const loggedMessages = this.getLoggedMessages(methodName);
    expect(
      loggedMessages.some((m) => m.includes(expectedLogMessagePart)),
      formatAssertionMessage([
        `Log function: ${methodName}`,
        `Expected log message part: ${expectedLogMessagePart}`,
        'Actual log messages:',
        loggedMessages.join('\n- '),
      ]),
    );
  }

  private getLoggedMessages(methodName: FunctionKeys<Logger>): string[] {
    const calls = this.callHistory.filter((m) => m.methodName === methodName);
    const loggedItems = calls.flatMap((call) => call.args);
    const stringLogs = loggedItems.filter((message): message is string => isString(message));
    return stringLogs;
  }
}
