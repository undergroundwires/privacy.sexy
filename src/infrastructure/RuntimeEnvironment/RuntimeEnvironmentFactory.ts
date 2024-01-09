import { BrowserRuntimeEnvironment } from './Browser/BrowserRuntimeEnvironment';
import { NodeRuntimeEnvironment } from './Node/NodeRuntimeEnvironment';
import { RuntimeEnvironment } from './RuntimeEnvironment';

export const CurrentEnvironment = determineAndCreateRuntimeEnvironment({
  getGlobalWindow: () => globalThis.window,
  getGlobalProcess: () => globalThis.process,
});

export function determineAndCreateRuntimeEnvironment(
  globalAccessor: GlobalAccessor,
  browserEnvironmentFactory: BrowserRuntimeEnvironmentFactory = (
    window,
  ) => new BrowserRuntimeEnvironment(window),
  nodeEnvironmentFactory: NodeRuntimeEnvironmentFactory = () => new NodeRuntimeEnvironment(),
): RuntimeEnvironment {
  if (globalAccessor.getGlobalProcess()) {
    return nodeEnvironmentFactory();
  }
  const window = globalAccessor.getGlobalWindow();
  if (window) {
    return browserEnvironmentFactory(window);
  }
  throw new Error('Unsupported runtime environment: The current context is neither a recognized browser nor a Node.js environment.');
}

export type BrowserRuntimeEnvironmentFactory = (window: Window) => RuntimeEnvironment;

export type NodeRuntimeEnvironmentFactory = () => NodeRuntimeEnvironment;

export interface GlobalAccessor {
  getGlobalWindow(): Window | undefined;
  getGlobalProcess(): NodeJS.Process | undefined;
}
