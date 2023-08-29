import { describe } from 'vitest';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { WindowVariablesStub } from '@tests/unit/shared/Stubs/WindowVariablesStub';
import { WindowInjectedLogger } from '@/infrastructure/Log/WindowInjectedLogger';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { itEachLoggingMethod } from './LoggerTestRunner';

describe('WindowInjectedLogger', () => {
  describe('throws if log is absent', () => {
    itEachAbsentObjectValue((absentValue) => {
      // arrange
      const expectedError = 'missing log';
      const windowVariables = new WindowVariablesStub()
        .withLog(absentValue);
      // act
      const act = () => new WindowInjectedLogger(windowVariables);
      // assert
      expect(act).to.throw(expectedError);
    });
  });
  describe('throws if window is absent', () => {
    itEachAbsentObjectValue((absentValue) => {
      // arrange
      const expectedError = 'missing window';
      const windowVariables = absentValue;
      // act
      const act = () => new WindowInjectedLogger(windowVariables);
      // assert
      expect(act).to.throw(expectedError);
    }, { excludeUndefined: true });
  });
  describe('methods log the provided params', () => {
    itEachLoggingMethod((functionName) => {
      // arrange
      const expectedParams = ['test', 123, { some: 'object' }];
      const loggerMock = new LoggerStub();
      const windowVariables = new WindowVariablesStub()
        .withLog(loggerMock);
      const logger = new WindowInjectedLogger(windowVariables);

      // act
      logger[functionName](...expectedParams);

      // assert
      expect(loggerMock.callHistory).to.have.lengthOf(1);
      expect(loggerMock.callHistory[0].methodName).to.equal(functionName);
      expect(loggerMock.callHistory[0].args).to.deep.equal(expectedParams);
    });
  });
});
