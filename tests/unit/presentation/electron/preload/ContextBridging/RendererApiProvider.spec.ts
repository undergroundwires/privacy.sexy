import { describe, it, expect } from 'vitest';
import { ApiFacadeFactory, provideWindowVariables } from '@/presentation/electron/preload/ContextBridging/RendererApiProvider';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { Logger } from '@/application/Common/Log/Logger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { CodeRunner } from '@/application/CodeRunner';
import { CodeRunnerStub } from '@tests/unit/shared/Stubs/CodeRunnerStub';
import { PropertyKeys } from '@/TypeHelpers';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';

describe('RendererApiProvider', () => {
  describe('provideWindowVariables', () => {
    interface WindowVariableTestCase {
      readonly description: string;
      setupContext(context: RendererApiProviderTestContext): RendererApiProviderTestContext;
      readonly expectedValue: unknown;
    }
    const testScenarios: Record<PropertyKeys<Required<WindowVariables>>, WindowVariableTestCase> = {
      isDesktop: {
        description: 'returns true',
        setupContext: (context) => context,
        expectedValue: true,
      },
      codeRunner: (() => {
        const codeRunner = new CodeRunnerStub();
        const createFacadeMock: ApiFacadeFactory = (obj) => obj;
        return {
          description: 'encapsulates correctly',
          setupContext: (context) => context
            .withCodeRunner(codeRunner)
            .withApiFacadeCreator(createFacadeMock),
          expectedValue: codeRunner,
        };
      })(),
      os: (() => {
        const operatingSystem = OperatingSystem.WindowsPhone;
        return {
          description: 'returns expected',
          setupContext: (context) => context.withOs(operatingSystem),
          expectedValue: operatingSystem,
        };
      })(),
      log: (() => {
        const logger = new LoggerStub();
        const createFacadeMock: ApiFacadeFactory = (obj) => obj;
        return {
          description: 'encapsulates correctly',
          setupContext: (context) => context
            .withLogger(logger)
            .withApiFacadeCreator(createFacadeMock),
          expectedValue: logger,
        };
      })(),
    };
    Object.entries(testScenarios).forEach((
      [property, { description, setupContext, expectedValue }],
    ) => {
      it(`${property}: ${description}`, () => {
        // arrange
        const testContext = setupContext(new RendererApiProviderTestContext());
        // act
        const variables = testContext.provideWindowVariables();
        // assert
        const actualValue = variables[property];
        expect(actualValue).to.equal(expectedValue);
      });
    });
  });
});

class RendererApiProviderTestContext {
  private codeRunner: CodeRunner = new CodeRunnerStub();

  private os: OperatingSystem = OperatingSystem.Android;

  private log: Logger = new LoggerStub();

  private apiFacadeCreator: ApiFacadeFactory = (obj) => obj;

  public withCodeRunner(codeRunner: CodeRunner): this {
    this.codeRunner = codeRunner;
    return this;
  }

  public withOs(os: OperatingSystem): this {
    this.os = os;
    return this;
  }

  public withLogger(log: Logger): this {
    this.log = log;
    return this;
  }

  public withApiFacadeCreator(apiFacadeCreator: ApiFacadeFactory): this {
    this.apiFacadeCreator = apiFacadeCreator;
    return this;
  }

  public provideWindowVariables() {
    return provideWindowVariables(
      () => this.codeRunner,
      () => this.log,
      () => this.os,
      this.apiFacadeCreator,
    );
  }
}
