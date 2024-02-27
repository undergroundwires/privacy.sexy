import { describe, expect } from 'vitest';
import { NoopLogger } from '@/infrastructure/Log/NoopLogger';
import type { Logger } from '@/application/Common/Log/Logger';
import { itEachLoggingMethod } from './LoggerTestRunner';

describe('NoopLogger', () => {
  describe('methods do not throw', () => {
    itEachLoggingMethod((functionName, testParameters) => {
      // arrange
      const randomParams = testParameters;
      const logger: Logger = new NoopLogger();

      // act
      const act = () => logger[functionName](...randomParams);

      // assert
      expect(act).to.not.throw();
    });
  });
});
