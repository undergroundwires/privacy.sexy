import { describe, expect } from 'vitest';
import { NoopLogger } from '@/infrastructure/Log/NoopLogger';
import { ILogger } from '@/infrastructure/Log/ILogger';
import { itEachLoggingMethod } from './LoggerTestRunner';

describe('NoopLogger', () => {
  describe('methods do not throw', () => {
    itEachLoggingMethod((functionName, testParameters) => {
      // arrange
      const randomParams = testParameters;
      const logger: ILogger = new NoopLogger();

      // act
      const act = () => logger[functionName](...randomParams);

      // assert
      expect(act).to.not.throw();
    });
  });
});
