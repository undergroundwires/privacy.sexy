import { describe, expect } from 'vitest';
import { StubWithObservableMethodCalls } from '@tests/unit/shared/Stubs/StubWithObservableMethodCalls';
import { createElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { itEachLoggingMethod } from './LoggerTestRunner';
import type { LogFunctions } from 'electron-log';

describe('ElectronLogger', () => {
  describe('methods log the provided params', () => {
    itEachLoggingMethod((functionName, testParameters) => {
      // arrange
      const expectedParams = testParameters;
      const electronLogMock = new ElectronLogStub();
      const logger = createElectronLogger(electronLogMock);

      // act
      logger[functionName](...expectedParams);

      // assert
      expect(electronLogMock.callHistory).to.have.lengthOf(1);
      expect(electronLogMock.callHistory[0].methodName).to.equal(functionName);
      expect(electronLogMock.callHistory[0].args).to.deep.equal(expectedParams);
    });
  });
});

class ElectronLogStub
  extends StubWithObservableMethodCalls<LogFunctions>
  implements LogFunctions {
  public error(...args: unknown[]) {
    this.registerMethodCall({
      methodName: 'error',
      args,
    });
  }

  public warn(...args: unknown[]) {
    this.registerMethodCall({
      methodName: 'warn',
      args,
    });
  }

  public verbose(...args: unknown[]): void {
    this.registerMethodCall({
      methodName: 'verbose',
      args,
    });
  }

  public debug(...args: unknown[]) {
    this.registerMethodCall({
      methodName: 'debug',
      args,
    });
  }

  public silly(...args: unknown[]) {
    this.registerMethodCall({
      methodName: 'silly',
      args,
    });
  }

  public log(...args: unknown[]) {
    this.registerMethodCall({
      methodName: 'log',
      args,
    });
  }

  public info(...args: unknown[]) {
    this.registerMethodCall({
      methodName: 'info',
      args,
    });
  }
}
