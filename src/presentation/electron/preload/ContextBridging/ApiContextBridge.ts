import { contextBridge } from 'electron/renderer';
import { bindObjectMethods } from './MethodContextBinder';
import { provideWindowVariables } from './RendererApiProvider';

export function connectApisWithContextBridge(
  bridgeConnector: BridgeConnector = contextBridge.exposeInMainWorld,
  apiObject: object = provideWindowVariables(),
  methodContextBinder: MethodContextBinder = bindObjectMethods,
) {
  Object.entries(apiObject).forEach(([key, value]) => {
    bridgeConnector(key, methodContextBinder(value));
  });
}

export type BridgeConnector = typeof contextBridge.exposeInMainWorld;

export type MethodContextBinder = typeof bindObjectMethods;
