import { ipcMain } from 'electron/main';
import { ipcRenderer } from 'electron/renderer';
import { FunctionKeys, isFunction } from '@/TypeHelpers';
import { IpcChannel } from './IpcChannel';

export function createIpcConsumerProxy<T>(
  channel: IpcChannel<T>,
  electronIpcRenderer: Electron.IpcRenderer = ipcRenderer,
): AsyncMethods<T> {
  const facade: Partial<T> = {};
  channel.accessibleMembers.forEach((member) => {
    const functionKey = member as string;
    const ipcChannel = getIpcChannelIdentifier(channel.namespace, functionKey);
    facade[functionKey] = ((...args: unknown[]) => {
      return electronIpcRenderer.invoke(ipcChannel, ...args);
    }) as AsyncMethods<T>[keyof T];
  });
  return facade as AsyncMethods<T>;
}

export function registerIpcChannel<T>(
  channel: IpcChannel<T>,
  originalObject: T,
  electronIpcMain: Electron.IpcMain = ipcMain,
) {
  channel.accessibleMembers.forEach((functionKey) => {
    const originalFunction = originalObject[functionKey];
    validateIpcFunction(functionKey, originalFunction, channel);
    const ipcChannel = getIpcChannelIdentifier(channel.namespace, functionKey as string);
    electronIpcMain.handle(ipcChannel, (_event, ...args: unknown[]) => {
      return originalFunction.apply(originalObject, args);
    });
  });
}

function validateIpcFunction<T>(
  functionKey: FunctionKeys<T>,
  functionValue: T[FunctionKeys<T>],
  channel: IpcChannel<T>,
): asserts functionValue is T[FunctionKeys<T>] & ((...args: unknown[]) => unknown) {
  const functionName = functionKey.toString();
  if (functionValue === undefined) {
    throwErrorWithContext(`The function "${functionName}" is not found on the target object.`);
  }
  if (!isFunction(functionValue)) {
    throwErrorWithContext('Non-function members are not yet supported.');
  }
  function throwErrorWithContext(message: string): never {
    throw new Error([
      message,
      `Channel: ${JSON.stringify(channel)}.`,
      `Function key: ${functionName}.`,
      `Value: ${JSON.stringify(functionValue)}`,
    ].join('\n'));
  }
}

function getIpcChannelIdentifier(namespace: string, key: string) {
  return `proxy:${namespace}:${key}`;
}

type AsyncMethods<T> = {
  [P in keyof T]: T[P] extends (...args: infer Args) => infer R
    ? R extends Promise<unknown>
      ? (...args: Args) => R
      : (...args: Args) => Promise<R>
    : never;
};
