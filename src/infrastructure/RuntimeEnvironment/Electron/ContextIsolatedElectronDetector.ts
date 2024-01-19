import { ElectronEnvironmentDetector, ElectronProcessType } from './ElectronEnvironmentDetector';

export class ContextIsolatedElectronDetector implements ElectronEnvironmentDetector {
  constructor(
    private readonly nodeProcessAccessor: NodeProcessAccessor = () => globalThis?.process,
    private readonly userAgentAccessor: UserAgentAccessor = () => globalThis?.navigator?.userAgent,
  ) { }

  public isRunningInsideElectron(): boolean {
    return isNodeProcessElectronBased(this.nodeProcessAccessor)
      || isUserAgentElectronBased(this.userAgentAccessor);
  }

  public determineElectronProcessType(): ElectronProcessType {
    const isNodeAccessible = isNodeProcessElectronBased(this.nodeProcessAccessor);
    const isBrowserAccessible = isUserAgentElectronBased(this.userAgentAccessor);
    if (!isNodeAccessible && !isBrowserAccessible) {
      throw new Error('Unable to determine the Electron process type. Neither Node.js nor browser-based Electron contexts were detected.');
    }
    if (isNodeAccessible && isBrowserAccessible) {
      return 'preloader'; // Only preloader can access both Node.js and browser contexts in Electron with context isolation.
    }
    if (isNodeAccessible) {
      return 'main';
    }
    return 'renderer';
  }
}

export type NodeProcessAccessor = () => NodeJS.Process | undefined;

function isNodeProcessElectronBased(nodeProcessAccessor: NodeProcessAccessor): boolean {
  const nodeProcess = nodeProcessAccessor();
  if (!nodeProcess) {
    return false;
  }
  if (nodeProcess.versions.electron) {
    // Electron populates `nodeProcess.versions.electron` with its version, see https://web.archive.org/web/20240113162837/https://www.electronjs.org/docs/latest/api/process#processversionselectron-readonly.
    return true;
  }
  return false;
}

export type UserAgentAccessor = () => string | undefined;

function isUserAgentElectronBased(
  userAgentAccessor: UserAgentAccessor,
): boolean {
  const userAgent = userAgentAccessor();
  if (userAgent?.includes('Electron')) {
    return true;
  }
  return false;
}
