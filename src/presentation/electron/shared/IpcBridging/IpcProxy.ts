import { ipcMain } from 'electron/main';
import { ipcRenderer } from 'electron/renderer';
import { isFunction } from '@/TypeHelpers';
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
    if (!isFunction(originalFunction)) {
      throw new Error('Non-function members are not yet supported');
    }
    const ipcChannel = getIpcChannelIdentifier(channel.namespace, functionKey as string);
    electronIpcMain.handle(ipcChannel, (_event, ...args: unknown[]) => {
      return originalFunction.apply(originalObject, args);
    });
  });
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
