import { describe, expect } from 'vitest';
import { StubWithObservableMethodCalls } from '@tests/unit/shared/Stubs/StubWithObservableMethodCalls';
import { ConsoleLogger } from '@/infrastructure/Log/ConsoleLogger';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { itEachLoggingMethod } from './LoggerTestRunner';

describe('ConsoleLogger', () => {
  describe('throws if console is missing', () => {
    itEachAbsentObjectValue((absentValue) => {
      // arrange
      const expectedError = 'missing console';
      const console = absentValue as never;
      // act
      const act = () => new ConsoleLogger(console);
      // assert
      expect(act).to.throw(expectedError);
    }, { excludeUndefined: true });
  });
  describe('methods log the provided params', () => {
    itEachLoggingMethod((functionName, testParameters) => {
      // arrange
      const expectedParams = testParameters;
      const consoleMock = new MockConsole();
      const logger = new ConsoleLogger(consoleMock);

      // act
      logger[functionName](...expectedParams);

      // assert
      expect(consoleMock.callHistory).to.have.lengthOf(1);
      expect(consoleMock.callHistory[0].methodName).to.equal(functionName);
      expect(consoleMock.callHistory[0].args).to.deep.equal(expectedParams);
    });
  });
  describe('throws if log function is missing', () => {
    itEachLoggingMethod((functionName, testParameters) => {
      // arrange
      const expectedError = `missing "${functionName}" function`;
      const consoleMock = {} as Partial<Console>;
      consoleMock[functionName] = undefined;
      const logger = new ConsoleLogger(consoleMock);

      // act
      const act = () => logger[functionName](...testParameters);

      // assert
      expect(act).to.throw(expectedError);
    });
  });
});

class MockConsole
  extends StubWithObservableMethodCalls<Console>
  implements Partial<Console> {
  public info(...args: unknown[]) {
    this.registerMethodCall({
      methodName: 'info',
      args,
    });
  }
}
