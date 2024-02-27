import { OperatingSystem } from '@/domain/OperatingSystem';
import type { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';
import { EnvironmentVariablesFactory } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';
import { ConditionBasedOsDetector } from './BrowserOs/ConditionBasedOsDetector';
import { isTouchEnabledDevice } from './TouchSupportDetection';
import type { RuntimeEnvironment } from '../RuntimeEnvironment';
import type { BrowserEnvironment, BrowserOsDetector } from './BrowserOs/BrowserOsDetector';

export class BrowserRuntimeEnvironment implements RuntimeEnvironment {
  public readonly isRunningAsDesktopApplication: boolean;

  public readonly os: OperatingSystem | undefined;

  public readonly isNonProduction: boolean;

  public constructor(
    window: Partial<Window>,
    environmentVariables: IEnvironmentVariables = EnvironmentVariablesFactory.Current.instance,
    browserOsDetector: BrowserOsDetector = new ConditionBasedOsDetector(),
    touchDetector: TouchDetector = isTouchEnabledDevice,
  ) {
    if (!window) { throw new Error('missing window'); } // do not trust strictNullChecks for global objects
    this.isNonProduction = environmentVariables.isNonProduction;
    this.isRunningAsDesktopApplication = isElectronRendererProcess(window);
    this.os = determineOperatingSystem(window, touchDetector, browserOsDetector);
  }
}

function isElectronRendererProcess(globalWindow: Partial<Window>): boolean {
  return globalWindow.isRunningAsDesktopApplication === true; // Preloader injects this
  // We could also do `globalWindow?.navigator?.userAgent?.includes('Electron') === true;`
}

function determineOperatingSystem(
  globalWindow: Partial<Window>,
  touchDetector: TouchDetector,
  browserOsDetector: BrowserOsDetector,
): OperatingSystem | undefined {
  const userAgent = globalWindow?.navigator?.userAgent;
  if (!userAgent) {
    return undefined;
  }
  const browserEnvironment: BrowserEnvironment = {
    userAgent,
    isTouchSupported: touchDetector(),
  };
  return browserOsDetector.detect(browserEnvironment);
}

type TouchDetector = () => boolean;
