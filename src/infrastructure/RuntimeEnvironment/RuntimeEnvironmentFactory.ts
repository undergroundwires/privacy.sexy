import { BrowserRuntimeEnvironment } from './Browser/BrowserRuntimeEnvironment';
import { NodeRuntimeEnvironment } from './Node/NodeRuntimeEnvironment';
import { RuntimeEnvironment } from './RuntimeEnvironment';

export const CurrentEnvironment = determineAndCreateRuntimeEnvironment({
  window: globalThis.window,
  process: globalThis.process,
});

export function determineAndCreateRuntimeEnvironment(
  globalAccessor: GlobalPropertiesAccessor,
  browserEnvironmentFactory: BrowserRuntimeEnvironmentFactory = (
    window,
  ) => new BrowserRuntimeEnvironment(window),
  nodeEnvironmentFactory: NodeRuntimeEnvironmentFactory = (
    process: NodeJS.Process,
  ) => new NodeRuntimeEnvironment(process),
): RuntimeEnvironment {
  if (isElectronMainProcess(globalAccessor.process)) {
    return nodeEnvironmentFactory(globalAccessor.process);
  }
  const { window } = globalAccessor;
  if (!window) {
    throw new Error('Unsupported runtime environment: The current context is neither a recognized browser nor a desktop environment.');
  }
  return browserEnvironmentFactory(window);
}

function isElectronMainProcess(
  nodeProcess: NodeJS.Process | undefined,
): nodeProcess is NodeJS.Process {
  // Electron populates `nodeProcess.versions.electron` with its version, see https://web.archive.org/web/20240113162837/https://www.electronjs.org/docs/latest/api/process#processversionselectron-readonly.
  if (!nodeProcess) {
    return false;
  }
  if (nodeProcess.versions.electron) {
    return true;
  }
  return false;
}

export type BrowserRuntimeEnvironmentFactory = (window: Window) => RuntimeEnvironment;

export type NodeRuntimeEnvironmentFactory = (process: NodeJS.Process) => NodeRuntimeEnvironment;

export interface GlobalPropertiesAccessor {
  readonly window: Window | undefined;
  readonly process: NodeJS.Process | undefined;
}
