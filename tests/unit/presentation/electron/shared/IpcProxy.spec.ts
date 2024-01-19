import { describe, it, expect } from 'vitest';
import { createIpcConsumerProxy, registerIpcChannel } from '@/presentation/electron/shared/IpcBridging/IpcProxy';
import { IpcChannel } from '@/presentation/electron/shared/IpcBridging/IpcChannel';

describe('IpcProxy', () => {
  describe('createIpcConsumerProxy', () => {
    describe('argument handling', () => {
      it('sync method in proxy correctly receives and forwards arguments', async () => {
        // arrange
        const expectedArg1 = 'expected-arg-1';
        const expectedArg2 = 2;
        interface TestSyncMethods {
          syncMethod(stringArg: string, numberArg: number): void;
        }
        const ipcChannelMock: IpcChannel<TestSyncMethods> = {
          namespace: 'testNamespace',
          accessibleMembers: ['syncMethod'],
        };
        const { registeredCallArgs, ipcRendererMock } = mockIpcRenderer();
        // act
        const proxy = createIpcConsumerProxy(ipcChannelMock, ipcRendererMock);
        await proxy.syncMethod(expectedArg1, expectedArg2);
        // assert
        expect(registeredCallArgs).to.have.lengthOf(1);
        const actualFunctionArgs = registeredCallArgs[0];
        expect(actualFunctionArgs).to.have.lengthOf(3);
        expect(actualFunctionArgs[1]).to.equal(expectedArg1);
        expect(actualFunctionArgs[2]).to.equal(expectedArg2);
      });
      it('sync method in proxy correctly returns expected value', async () => {
        // arrange
        const expectedArg1 = 'expected-arg-1';
        const expectedArg2 = 2;
        interface TestAsyncMethods {
          asyncMethod(stringArg: string, numberArg: number): Promise<void>;
        }
        const mockedIpcChannel: IpcChannel<TestAsyncMethods> = {
          namespace: 'testNamespace',
          accessibleMembers: ['asyncMethod'],
        };
        const { registeredCallArgs, ipcRendererMock } = mockIpcRenderer();
        // act
        const proxy = createIpcConsumerProxy(mockedIpcChannel, ipcRendererMock);
        await proxy.asyncMethod(expectedArg1, expectedArg2);
        // assert
        expect(registeredCallArgs).to.have.lengthOf(1);
        const actualFunctionArgs = registeredCallArgs[0];
        expect(actualFunctionArgs).to.have.lengthOf(3);
        expect(actualFunctionArgs[1]).to.equal(expectedArg1);
        expect(actualFunctionArgs[2]).to.equal(expectedArg2);
      });
    });
    describe('return value handling', () => {
      it('sync function returns correct value', async () => {
        // arrange
        const expectedReturnValue = 'expected-return-value';
        interface TestSyncMethods {
          syncMethod(): typeof expectedReturnValue;
        }
        const ipcChannelMock: IpcChannel<TestSyncMethods> = {
          namespace: 'testNamespace',
          accessibleMembers: ['syncMethod'],
        };
        const { ipcRendererMock } = mockIpcRenderer(Promise.resolve(expectedReturnValue));
        // act
        const proxy = createIpcConsumerProxy(ipcChannelMock, ipcRendererMock);
        const actualReturnValue = await proxy.syncMethod();
        // assert
        expect(actualReturnValue).to.equal(expectedReturnValue);
      });
      it('async function returns correct value', async () => {
        // arrange
        const expectedReturnValue = 'expected-return-value';
        interface TestAsyncMethods {
          asyncMethod(): Promise<typeof expectedReturnValue>;
        }
        const ipcChannelMock: IpcChannel<TestAsyncMethods> = {
          namespace: 'testNamespace',
          accessibleMembers: ['asyncMethod'],
        };
        const { ipcRendererMock } = mockIpcRenderer(Promise.resolve(expectedReturnValue));
        // act
        const proxy = createIpcConsumerProxy(ipcChannelMock, ipcRendererMock);
        const actualReturnValue = await proxy.asyncMethod();
        // assert
        expect(actualReturnValue).to.equal(expectedReturnValue);
      });
    });
  });
  describe('registerIpcChannel', () => {
    describe('original function invocation', () => {
      it('sync function is called with correct arguments', () => {
        // arrange
        const expectedArgumentValues = ['first-argument-value', 42];
        const syncMethodName = 'syncMethod';
        const testObject = {
          [syncMethodName]: (stringArg: string, numberArg: number) => {
            recordedMethodArguments.push([stringArg, numberArg]);
          },
        };
        const recordedMethodArguments = new Array<Parameters<typeof testObject['syncMethod']>>();
        const testIpcChannel: IpcChannel<typeof testObject> = {
          namespace: 'testNamespace',
          accessibleMembers: [syncMethodName],
        };
        const { ipcMainMock, registeredHandlersByChannel } = mockIpcMain();

        // act
        registerIpcChannel(testIpcChannel, testObject, ipcMainMock);
        const proxyFunction = registeredHandlersByChannel[
          Object.keys(registeredHandlersByChannel)[0]];
        proxyFunction(null, ...expectedArgumentValues);

        // assert
        expect(recordedMethodArguments).to.have.lengthOf(1);
        const actualArgumentValues = recordedMethodArguments[0];
        expect(actualArgumentValues).to.deep.equal(expectedArgumentValues);
      });
      it('async function is called with correct arguments', async () => {
        // arrange
        const expectedArgumentValues = ['first-argument-value', 42];
        const asyncMethodName = 'asyncMethod';
        const testObject = {
          [asyncMethodName]: (stringArg: string, numberArg: number) => {
            recordedMethodArguments.push([stringArg, numberArg]);
            return Promise.resolve();
          },
        };
        const recordedMethodArguments = new Array<Parameters<typeof testObject['asyncMethod']>>();
        const testIpcChannel: IpcChannel<typeof testObject> = {
          namespace: 'testNamespace',
          accessibleMembers: [asyncMethodName],
        };
        const { ipcMainMock, registeredHandlersByChannel } = mockIpcMain();

        // act
        registerIpcChannel(testIpcChannel, testObject, ipcMainMock);
        const proxyFunction = registeredHandlersByChannel[
          Object.keys(registeredHandlersByChannel)[0]];
        await proxyFunction(null, ...expectedArgumentValues);

        // assert
        expect(recordedMethodArguments).to.have.lengthOf(1);
        expect(recordedMethodArguments[0]).to.deep.equal(expectedArgumentValues);
      });
    });
    describe('return value handling', () => {
      it('sync function returns correct value', () => {
        // arrange
        const expectedReturnValue = 'expected-return-value';
        const syncMethodName = 'syncMethod';
        const testObject = {
          [syncMethodName]: () => expectedReturnValue,
        };
        const testIpcChannel: IpcChannel<typeof testObject> = {
          namespace: 'testNamespace',
          accessibleMembers: [syncMethodName],
        };
        const { ipcMainMock, registeredHandlersByChannel } = mockIpcMain();

        // act
        registerIpcChannel(testIpcChannel, testObject, ipcMainMock);
        const proxyFunction = registeredHandlersByChannel[
          Object.keys(registeredHandlersByChannel)[0]];
        const actualReturnValue = proxyFunction(null);

        // assert
        expect(actualReturnValue).to.equal(expectedReturnValue);
      });
      it('async function returns correct value', async () => {
        // arrange
        const expectedReturnValue = 'expected-return-value';
        const asyncMethodName = 'asyncMethod';
        const testObject = {
          [asyncMethodName]: () => Promise.resolve(expectedReturnValue),
        };
        const testIpcChannel: IpcChannel<typeof testObject> = {
          namespace: 'testNamespace',
          accessibleMembers: [asyncMethodName],
        };
        const { ipcMainMock, registeredHandlersByChannel } = mockIpcMain();

        // act
        registerIpcChannel(testIpcChannel, testObject, ipcMainMock);
        const proxyFunction = registeredHandlersByChannel[
          Object.keys(registeredHandlersByChannel)[0]];
        const actualReturnValue = await proxyFunction(null);

        // assert
        expect(actualReturnValue).to.equal(expectedReturnValue);
      });
    });
    it('registers channel names for each member', () => {
      // arrange
      const namespace = 'testNamespace';
      const method1Name = 'method1';
      const method2Name = 'method2';
      const expectedChannelNames = [
        `proxy:${namespace}:${method1Name}`,
        `proxy:${namespace}:${method2Name}`,
      ];
      const testObject = {
        [`${method1Name}`]: () => {},
        [`${method2Name}`]: () => Promise.resolve(),
      };
      const testIpcChannel: IpcChannel<typeof testObject> = {
        namespace: 'testNamespace',
        accessibleMembers: [method1Name, method2Name],
      };
      const { ipcMainMock, registeredHandlersByChannel } = mockIpcMain();
      // act
      registerIpcChannel(testIpcChannel, testObject, ipcMainMock);
      // assert
      const actualChannelNames = Object.keys(registeredHandlersByChannel);
      expect(actualChannelNames).to.have.lengthOf(expectedChannelNames.length);
      expect(actualChannelNames).to.have.members(expectedChannelNames);
    });
    describe('validation', () => {
      it('throws error for non-function members', () => {
        // arrange
        const expectedError = 'Non-function members are not yet supported';
        const propertyName = 'propertyKey';
        const testObject = { [`${propertyName}`]: 123 };
        const testIpcChannel: IpcChannel<typeof testObject> = {
          namespace: 'testNamespace',
          accessibleMembers: [propertyName] as never,
        };
        // act
        const act = () => registerIpcChannel(testIpcChannel, testObject, mockIpcMain().ipcMainMock);
        // assert
        expect(act).to.throw(expectedError);
      });
      it('throws error for undefined members', () => {
        // arrange
        const nonExistingFunctionName = 'nonExistingFunction';
        const expectedError = `The function "${nonExistingFunctionName}" is not found on the target object.`;
        const testObject = { };
        const testIpcChannel: IpcChannel<typeof testObject> = {
          namespace: 'testNamespace',
          accessibleMembers: [nonExistingFunctionName] as never,
        };
        // act
        const act = () => registerIpcChannel(testIpcChannel, testObject, mockIpcMain().ipcMainMock);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
});

function mockIpcMain() {
  const registeredHandlersByChannel: Record<string, (...args: unknown[]) => unknown> = {};
  const ipcMainMock: Partial<Electron.IpcMain> = {
    handle: (channel, handler) => {
      registeredHandlersByChannel[channel] = handler;
    },
  };
  return {
    ipcMainMock: ipcMainMock as Electron.IpcMain,
    registeredHandlersByChannel,
  };
}

function mockIpcRenderer(returnValuePromise: Promise<unknown> = Promise.resolve()) {
  const registeredCallArgs = new Array<Parameters<Electron.IpcRenderer['invoke']>>();
  const ipcRendererMock: Partial<Electron.IpcRenderer> = {
    invoke: (...args) => {
      registeredCallArgs.push([...args]);
      return returnValuePromise;
    },
  };
  return {
    ipcRendererMock: ipcRendererMock as Electron.IpcRenderer,
    registeredCallArgs,
  };
}
