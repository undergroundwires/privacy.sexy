// eslint-disable-next-line max-classes-per-file
import { describe, it } from 'vitest';
import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { ClientLoggerFactory, LoggerCreationFunction, WindowAccessor } from '@/presentation/bootstrapping/ClientLoggerFactory';
import { Logger } from '@/application/Common/Log/Logger';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';
import { itIsSingleton } from '@tests/unit/shared/TestCases/SingletonTests';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';

describe('ClientLoggerFactory', () => {
  describe('Current', () => {
    describe('singleton behavior', () => {
      itIsSingleton({
        getter: () => ClientLoggerFactory.Current,
        expectedType: ClientLoggerFactory,
      });
    });
  });
  describe('logger instantiation based on environment', () => {
    const testCases: Array<{
      readonly description: string,
      readonly build: (
        builder: ClientLoggerFactoryBuilder,
        expectedLogger: Logger,
      ) => ClientLoggerFactory,
    }> = [
      {
        description: 'production desktop environment',
        build: (b, expectedLogger) => b
          .withWindowInjectedLoggerFactory(() => expectedLogger)
          .withEnvironment(new RuntimeEnvironmentStub()
            .withIsDesktop(true)
            .withIsNonProduction(false))
          .withWindowAccessor(() => createWindowWithLogger())
          .build(),
      },
      {
        description: 'non-production desktop environment',
        build: (b, expectedLogger) => b
          .withWindowInjectedLoggerFactory(() => expectedLogger)
          .withEnvironment(new RuntimeEnvironmentStub()
            .withIsDesktop(true)
            .withIsNonProduction(true))
          .withWindowAccessor(() => createWindowWithLogger())
          .build(),
      },
      {
        description: 'non-production web environment',
        build: (b, expectedLogger) => b
          .withConsoleLoggerFactory(() => expectedLogger)
          .withEnvironment(new RuntimeEnvironmentStub()
            .withIsDesktop(false)
            .withIsNonProduction(true))
          .withWindowAccessor(() => createWindowWithLogger())
          .build(),
      },
      {
        description: 'production web environment',
        build: (b, expectedLogger) => b
          .withNoopLoggerFactory(() => expectedLogger)
          .withEnvironment(new RuntimeEnvironmentStub()
            .withIsDesktop(false)
            .withIsNonProduction(false))
          .withWindowAccessor(() => createWindowWithLogger())
          .build(),
      },
      {
        description: 'unit/integration tests environment',
        build: (b, expectedLogger) => b
          .withNoopLoggerFactory(() => expectedLogger)
          .withEnvironment(new RuntimeEnvironmentStub().withIsDesktop(true))
          .withWindowAccessor(() => createWindowWithLogger(null))
          .build(),
      },
    ];
    testCases.forEach(({ description, build }) => {
      it(`creates correct logger for ${description}`, () => {
        // arrange
        const expectedLogger = new LoggerStub();
        const factory = build(new ClientLoggerFactoryBuilder(), expectedLogger);
        // act
        const { logger } = factory;
        // assert
        expect(logger).to.equal(expectedLogger);
      });
    });
  });
});

function createWindowWithLogger(logger: Logger | null = new LoggerStub()): Window {
  return {
    log: logger,
  } as unknown as Window;
}

class ClientLoggerFactoryBuilder {
  private environment: RuntimeEnvironment = new RuntimeEnvironmentStub();

  private windowAccessor: WindowAccessor = () => ({} as Window);

  private noopLoggerFactory: LoggerCreationFunction = () => new LoggerStub();

  private windowInjectedLoggerFactory: LoggerCreationFunction = () => new LoggerStub();

  private consoleLoggerFactory: LoggerCreationFunction = () => new LoggerStub();

  public withWindowAccessor(windowAccessor: WindowAccessor): this {
    this.windowAccessor = windowAccessor;
    return this;
  }

  public withEnvironment(environment: RuntimeEnvironment): this {
    this.environment = environment;
    return this;
  }

  public withNoopLoggerFactory(factory: LoggerCreationFunction): this {
    this.noopLoggerFactory = factory;
    return this;
  }

  public withWindowInjectedLoggerFactory(factory: LoggerCreationFunction): this {
    this.windowInjectedLoggerFactory = factory;
    return this;
  }

  public withConsoleLoggerFactory(factory: LoggerCreationFunction): this {
    this.consoleLoggerFactory = factory;
    return this;
  }

  public build(): ClientLoggerFactory {
    return new TestableClientLoggerFactory(
      this.environment,
      this.windowAccessor,
      this.noopLoggerFactory,
      this.windowInjectedLoggerFactory,
      this.consoleLoggerFactory,
    );
  }
}

class TestableClientLoggerFactory extends ClientLoggerFactory {
  public constructor(
    environment: RuntimeEnvironment,
    windowAccessor: WindowAccessor,
    noopLoggerFactory: LoggerCreationFunction,
    windowInjectedLoggerFactory: LoggerCreationFunction,
    consoleLoggerFactory: LoggerCreationFunction,
  ) {
    super(
      environment,
      windowAccessor,
      noopLoggerFactory,
      windowInjectedLoggerFactory,
      consoleLoggerFactory,
    );
  }
}
