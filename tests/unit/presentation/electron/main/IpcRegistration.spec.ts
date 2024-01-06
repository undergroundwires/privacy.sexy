import { describe, it, expect } from 'vitest';
import { CodeRunnerStub } from '@tests/unit/shared/Stubs/CodeRunnerStub';
import { IpcChannelDefinitions } from '@/presentation/electron/shared/IpcBridging/IpcChannelDefinitions';
import { CodeRunnerFactory, IpcRegistrar, registerAllIpcChannels } from '@/presentation/electron/main/IpcRegistration';
import { IpcChannel } from '@/presentation/electron/shared/IpcBridging/IpcChannel';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { collectExceptionMessage } from '@tests/unit/shared/ExceptionCollector';

describe('IpcRegistration', () => {
  describe('registerAllIpcChannels', () => {
    it('registers all defined IPC channels', () => {
      Object.entries(IpcChannelDefinitions).forEach(([key, expectedChannel]) => {
        it(key, () => {
          // arrange
          const { registrarMock, isChannelRegistered } = createIpcRegistrarMock();
          const context = new IpcRegistrationTestSetup()
            .withRegistrar(registrarMock);
          // act
          context.run();
          // assert
          expect(isChannelRegistered(expectedChannel)).to.equal(true);
        });
      });
    });
    describe('registers expected instances', () => {
      const testScenarios: Record<keyof typeof IpcChannelDefinitions, {
        buildContext: (context: IpcRegistrationTestSetup) => IpcRegistrationTestSetup,
        expectedInstance: object,
      }> = {
        CodeRunner: (() => {
          const expectedInstance = new CodeRunnerStub();
          return {
            buildContext: (c) => c.withCodeRunnerFactory(() => expectedInstance),
            expectedInstance,
          };
        })(),
      };
      Object.entries(testScenarios).forEach(([
        key, { buildContext, expectedInstance },
      ]) => {
        it(key, () => {
          // arrange
          const { registrarMock, getRegisteredInstance } = createIpcRegistrarMock();
          const context = buildContext(new IpcRegistrationTestSetup()
            .withRegistrar(registrarMock));
          // act
          context.run();
          // assert
          const actualInstance = getRegisteredInstance(IpcChannelDefinitions.CodeRunner);
          expect(actualInstance).to.equal(expectedInstance);
        });
      });
    });
    it('throws an error if registration fails', () => {
      // arrange
      const expectedError = 'registrar error';
      const registrarMock: IpcRegistrar = () => {
        throw new Error(expectedError);
      };
      const context = new IpcRegistrationTestSetup()
        .withRegistrar(registrarMock);
      // act
      const exceptionMessage = collectExceptionMessage(() => context.run());
      // assert
      expect(exceptionMessage).to.include(expectedError);
    });
  });
});

class IpcRegistrationTestSetup {
  private codeRunnerFactory: CodeRunnerFactory = () => new CodeRunnerStub();

  private registrar: IpcRegistrar = () => { /* NOOP */ };

  public withRegistrar(registrar: IpcRegistrar): this {
    this.registrar = registrar;
    return this;
  }

  public withCodeRunnerFactory(codeRunnerFactory: CodeRunnerFactory): this {
    this.codeRunnerFactory = codeRunnerFactory;
    return this;
  }

  public run() {
    registerAllIpcChannels(
      this.codeRunnerFactory,
      this.registrar,
    );
  }
}

function createIpcRegistrarMock() {
  const registeredChannels = new Array<Parameters<IpcRegistrar>>();
  const registrarMock: IpcRegistrar = <T>(channel: IpcChannel<T>, obj: T) => {
    registeredChannels.push([channel as IpcChannel<unknown>, obj]);
  };
  const isChannelRegistered = <T>(channel: IpcChannel<T>): boolean => {
    return registeredChannels.some((i) => i[0] === channel);
  };
  const getRegisteredInstance = <T>(channel: IpcChannel<T>): unknown => {
    const registration = registeredChannels.find((i) => i[0] === channel);
    expectExists(registration);
    return registration[1];
  };
  return {
    registrarMock,
    isChannelRegistered,
    getRegisteredInstance,
  };
}
