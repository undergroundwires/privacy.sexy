import { OperatingSystem } from '@/domain/OperatingSystem';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';
import { EnvironmentVariablesFactory } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';
import { ConditionBasedOsDetector } from './BrowserOs/ConditionBasedOsDetector';
import { BrowserEnvironment, BrowserOsDetector } from './BrowserOs/BrowserOsDetector';
import { RuntimeEnvironment } from './RuntimeEnvironment';
import { isTouchEnabledDevice } from './TouchSupportDetection';

export class HostRuntimeEnvironment implements RuntimeEnvironment {
  public static readonly CurrentEnvironment
  : RuntimeEnvironment = new HostRuntimeEnvironment(window);

  public readonly isDesktop: boolean;

  public readonly os: OperatingSystem | undefined;

  public readonly isNonProduction: boolean;

  protected constructor(
    window: Partial<Window>,
    environmentVariables: IEnvironmentVariables = EnvironmentVariablesFactory.Current.instance,
    browserOsDetector: BrowserOsDetector = new ConditionBasedOsDetector(),
    touchDetector = isTouchEnabledDevice,
  ) {
    if (!window) { throw new Error('missing window'); } // do not trust strictNullChecks for global objects
    this.isNonProduction = environmentVariables.isNonProduction;
    this.isDesktop = isDesktop(window);
    if (this.isDesktop) {
      this.os = window?.os;
    } else {
      this.os = undefined;
      const userAgent = getUserAgent(window);
      if (userAgent) {
        const browserEnvironment: BrowserEnvironment = {
          userAgent,
          isTouchSupported: touchDetector(),
        };
        this.os = browserOsDetector.detect(browserEnvironment);
      }
    }
  }
}

function getUserAgent(window: Partial<Window>): string | undefined {
  return window?.navigator?.userAgent;
}

function isDesktop(window: Partial<WindowVariables>): boolean {
  return window?.isDesktop === true;
}
