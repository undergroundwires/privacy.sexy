import { describe, it, expect } from 'vitest';
import { ApiFacadeFactory, IpcConsumerProxyCreator, provideWindowVariables } from '@/presentation/electron/preload/ContextBridging/RendererApiProvider';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { Logger } from '@/application/Common/Log/Logger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { PropertyKeys } from '@/TypeHelpers';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { IpcChannelDefinitions } from '@/presentation/electron/shared/IpcBridging/IpcChannelDefinitions';
import { IpcChannel } from '@/presentation/electron/shared/IpcBridging/IpcChannel';

describe('RendererApiProvider', () => {
  describe('provideWindowVariables', () => {
    interface WindowVariableTestCase {
      readonly description: string;
      setupContext(context: RendererApiProviderTestContext): RendererApiProviderTestContext;
      readonly expectedValue: unknown;
    }
    const testScenarios: Record<PropertyKeys<Required<WindowVariables>>, WindowVariableTestCase> = {
      isRunningAsDesktopApplication: {
        description: 'returns true',
        setupContext: (context) => context,
        expectedValue: true,
      },
      codeRunner: expectIpcConsumer(IpcChannelDefinitions.CodeRunner),
      os: (() => {
        const operatingSystem = OperatingSystem.WindowsPhone;
        return {
          description: 'returns expected',
          setupContext: (context) => context.withOs(operatingSystem),
          expectedValue: operatingSystem,
        };
      })(),
      log: expectFacade({
        instance: new LoggerStub(),
        setupContext: (c, logger) => c.withLogger(logger),
      }),
      dialog: expectIpcConsumer(IpcChannelDefinitions.Dialog),
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
    function expectIpcConsumer<T>(expectedDefinition: IpcChannel<T>): WindowVariableTestCase {
      const ipcConsumerCreator: IpcConsumerProxyCreator = (definition) => definition as never;
      return {
        description: 'creates correct IPC consumer',
        setupContext: (context) => context
          .withIpcConsumerCreator(ipcConsumerCreator),
        expectedValue: expectedDefinition,
      };
    }
    function expectFacade<T>(options: {
      readonly instance: T;
      setupContext: (
        context: RendererApiProviderTestContext,
        instance: T,
      ) => RendererApiProviderTestContext;
    }): WindowVariableTestCase {
      const createFacadeMock: ApiFacadeFactory = (obj) => obj;
      return {
        description: 'creates correct facade',
        setupContext: (context) => options.setupContext(
          context.withApiFacadeCreator(createFacadeMock),
          options.instance,
        ),
        expectedValue: options.instance,
      };
    }
  });
});

class RendererApiProviderTestContext {
  private os: OperatingSystem = OperatingSystem.Android;

  private log: Logger = new LoggerStub();

  private apiFacadeCreator: ApiFacadeFactory = (obj) => obj;

  private ipcConsumerCreator: IpcConsumerProxyCreator = () => { return {} as never; };

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

  public withIpcConsumerCreator(ipcConsumerCreator: IpcConsumerProxyCreator): this {
    this.ipcConsumerCreator = ipcConsumerCreator;
    return this;
  }

  public provideWindowVariables() {
    return provideWindowVariables(
      () => this.log,
      () => this.os,
      this.apiFacadeCreator,
      this.ipcConsumerCreator,
    );
  }
}
