import { BrowserRuntimeEnvironment } from './Browser/BrowserRuntimeEnvironment';
import { NodeRuntimeEnvironment } from './Node/NodeRuntimeEnvironment';
import { RuntimeEnvironment } from './RuntimeEnvironment';

export const CurrentEnvironment = determineAndCreateRuntimeEnvironment(
  () => globalThis.window,
);

export function determineAndCreateRuntimeEnvironment(
  windowAccessor: WindowAccessor,
  browserEnvironmentFactory: BrowserRuntimeEnvironmentFactory = (
    window,
  ) => new BrowserRuntimeEnvironment(window),
  nodeEnvironmentFactory: NodeRuntimeEnvironmentFactory = () => new NodeRuntimeEnvironment(),
): RuntimeEnvironment {
  const window = windowAccessor();
  if (window) {
    return browserEnvironmentFactory(window);
  }
  return nodeEnvironmentFactory();
}

export type BrowserRuntimeEnvironmentFactory = (window: Window) => RuntimeEnvironment;

export type NodeRuntimeEnvironmentFactory = () => NodeRuntimeEnvironment;

export type WindowAccessor = () => Window | undefined;
