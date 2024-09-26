import { describe, it, expect } from 'vitest';
import { CodeRunnerStub } from '@tests/unit/shared/Stubs/CodeRunnerStub';
import { type ChannelDefinitionKey, IpcChannelDefinitions } from '@/presentation/electron/shared/IpcBridging/IpcChannelDefinitions';
import {
  type CodeRunnerFactory, type DialogFactory, type IpcChannelRegistrar,
  type ScriptDiagnosticsCollectorFactory, registerAllIpcChannels,
} from '@/presentation/electron/main/IpcRegistration';
import type { IpcChannel } from '@/presentation/electron/shared/IpcBridging/IpcChannel';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { collectExceptionMessage } from '@tests/unit/shared/ExceptionCollector';
import { DialogStub } from '@tests/unit/shared/Stubs/DialogStub';
import { ScriptDiagnosticsCollectorStub } from '../../../shared/Stubs/ScriptDiagnosticsCollectorStub';

describe('IpcRegistration', () => {
  describe('registerAllIpcChannels', () => {
    describe('registers all defined IPC channels', () => {
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
      const testScenarios: Record<ChannelDefinitionKey, {
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
        Dialog: (() => {
          const expectedInstance = new DialogStub();
          return {
            buildContext: (c) => c.withDialogFactory(() => expectedInstance),
            expectedInstance,
          };
        })(),
        ScriptDiagnosticsCollector: (() => {
          const expectedInstance = new ScriptDiagnosticsCollectorStub();
          return {
            buildContext: (c) => c.withScriptDiagnosticsCollectorFactory(() => expectedInstance),
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
          const channel = IpcChannelDefinitions[key as ChannelDefinitionKey] as IpcChannel<unknown>;
          const actualInstance = getRegisteredInstance(channel);
          expect(actualInstance).to.equal(expectedInstance);
        });
      });
    });
    it('throws an error if registration fails', () => {
      // arrange
      const expectedError = 'registrar error';
      const registrarMock: IpcChannelRegistrar = () => {
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
  private registrar: IpcChannelRegistrar = () => { /* NOOP */ };

  private codeRunnerFactory: CodeRunnerFactory = () => new CodeRunnerStub();

  private dialogFactory: DialogFactory = () => new DialogStub();

  private scriptDiagnosticsCollectorFactory
  : ScriptDiagnosticsCollectorFactory = () => new ScriptDiagnosticsCollectorStub();

  public withRegistrar(registrar: IpcChannelRegistrar): this {
    this.registrar = registrar;
    return this;
  }

  public withCodeRunnerFactory(codeRunnerFactory: CodeRunnerFactory): this {
    this.codeRunnerFactory = codeRunnerFactory;
    return this;
  }

  public withDialogFactory(dialogFactory: DialogFactory): this {
    this.dialogFactory = dialogFactory;
    return this;
  }

  public withScriptDiagnosticsCollectorFactory(
    scriptDiagnosticsCollectorFactory: ScriptDiagnosticsCollectorFactory,
  ): this {
    this.scriptDiagnosticsCollectorFactory = scriptDiagnosticsCollectorFactory;
    return this;
  }

  public run() {
    registerAllIpcChannels(
      this.registrar,
      this.codeRunnerFactory,
      this.dialogFactory,
      this.scriptDiagnosticsCollectorFactory,
    );
  }
}

type DefinedIpcChannelTypes = {
  [K in ChannelDefinitionKey]: (typeof IpcChannelDefinitions)[K]
}[ChannelDefinitionKey];

function createIpcRegistrarMock() {
  const registeredChannels = new Array<Parameters<IpcChannelRegistrar>>();
  const registrarMock: IpcChannelRegistrar = <T>(channel: IpcChannel<T>, obj: T) => {
    registeredChannels.push([channel as IpcChannel<unknown>, obj]);
  };
  const isChannelRegistered = (channel: DefinedIpcChannelTypes): boolean => {
    return registeredChannels.some((i) => i[0] === channel);
  };
  const getRegisteredInstance = <T>(channel: IpcChannel<T>): T => {
    const registration = registeredChannels.find((i) => i[0] === channel);
    expectExists(registration);
    const [, registeredInstance] = registration;
    return registeredInstance as T;
  };
  return {
    registrarMock,
    isChannelRegistered,
    getRegisteredInstance,
  };
}
