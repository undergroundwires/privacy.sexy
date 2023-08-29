import {
  describe, it, beforeEach, afterEach,
} from 'vitest';
import { IRuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/IRuntimeEnvironment';
import { ClientLoggerFactory } from '@/presentation/bootstrapping/ClientLoggerFactory';
import { ILogger } from '@/infrastructure/Log/ILogger';
import { WindowInjectedLogger } from '@/infrastructure/Log/WindowInjectedLogger';
import { ConsoleLogger } from '@/infrastructure/Log/ConsoleLogger';
import { NoopLogger } from '@/infrastructure/Log/NoopLogger';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';
import { Constructible } from '@/TypeHelpers';
import { itIsSingleton } from '@tests/unit/shared/TestCases/SingletonTests';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';

describe('ClientLoggerFactory', () => {
  describe('Current', () => {
    itIsSingleton({
      getter: () => ClientLoggerFactory.Current,
      expectedType: ClientLoggerFactory,
    });
  });
  describe('logger instantiation based on environment', () => {
    const originalWindow = { ...window };
    beforeEach(() => {
      Object.assign(window, { log: new LoggerStub() });
    });
    afterEach(() => {
      Object.assign(window, originalWindow);
    });
    const testCases: Array<{
      readonly description: string,
      readonly expectedType: Constructible<ILogger>,
      readonly environment: IRuntimeEnvironment,
    }> = [
      {
        description: 'desktop environment',
        expectedType: WindowInjectedLogger,
        environment: new RuntimeEnvironmentStub()
          .withIsDesktop(true),
      },
      {
        description: 'non-production and desktop environment',
        expectedType: WindowInjectedLogger,
        environment: new RuntimeEnvironmentStub()
          .withIsDesktop(true)
          .withIsNonProduction(true),
      },
      {
        description: 'non-production without desktop',
        expectedType: ConsoleLogger,
        environment: new RuntimeEnvironmentStub()
          .withIsDesktop(false)
          .withIsNonProduction(true),
      },
      {
        description: 'production without desktop',
        expectedType: NoopLogger,
        environment: new RuntimeEnvironmentStub()
          .withIsDesktop(false)
          .withIsNonProduction(false),
      },
    ];
    testCases.forEach(({ description, expectedType, environment }) => {
      it(`instantiates ${expectedType.name} for ${description}`, () => {
        // arrange
        const factory = new TestableClientLoggerFactory(environment);
        // act
        const { logger } = factory;
        // assert
        expect(logger).to.be.instanceOf(expectedType);
      });
    });
  });
});

class TestableClientLoggerFactory extends ClientLoggerFactory {
  public constructor(environment: IRuntimeEnvironment) {
    super(environment);
  }
}
