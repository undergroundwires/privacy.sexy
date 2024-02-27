import { BrowserRuntimeEnvironment } from './Browser/BrowserRuntimeEnvironment';
import { NodeRuntimeEnvironment } from './Node/NodeRuntimeEnvironment';
import { ContextIsolatedElectronDetector } from './Electron/ContextIsolatedElectronDetector';
import type { RuntimeEnvironment } from './RuntimeEnvironment';
import type { ElectronEnvironmentDetector } from './Electron/ElectronEnvironmentDetector';

export const CurrentEnvironment = determineAndCreateRuntimeEnvironment(globalThis.window);

export function determineAndCreateRuntimeEnvironment(
  globalWindow: Window | undefined | null = globalThis.window,
  electronDetector: ElectronEnvironmentDetector = new ContextIsolatedElectronDetector(),
  browserEnvironmentFactory: BrowserRuntimeEnvironmentFactory = (
    window,
  ) => new BrowserRuntimeEnvironment(window),
  nodeEnvironmentFactory: NodeRuntimeEnvironmentFactory = () => new NodeRuntimeEnvironment(),
): RuntimeEnvironment {
  if (
    electronDetector.isRunningInsideElectron()
    && electronDetector.determineElectronProcessType() === 'main') {
    return nodeEnvironmentFactory();
  }
  if (!globalWindow) {
    throw new Error('Unsupported runtime environment: The current context is neither a recognized browser nor a desktop environment.');
  }
  return browserEnvironmentFactory(globalWindow);
}

export type BrowserRuntimeEnvironmentFactory = (window: Window) => RuntimeEnvironment;

export type NodeRuntimeEnvironmentFactory = () => NodeRuntimeEnvironment;

export type GlobalWindowAccessor = Window | undefined;
