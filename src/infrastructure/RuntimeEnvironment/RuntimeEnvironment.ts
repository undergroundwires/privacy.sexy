import { OperatingSystem } from '@/domain/OperatingSystem';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';
import { EnvironmentVariablesFactory } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';
import { BrowserOsDetector } from './BrowserOs/BrowserOsDetector';
import { IBrowserOsDetector } from './BrowserOs/IBrowserOsDetector';
import { IRuntimeEnvironment } from './IRuntimeEnvironment';

export class RuntimeEnvironment implements IRuntimeEnvironment {
  public static readonly CurrentEnvironment: IRuntimeEnvironment = new RuntimeEnvironment(window);

  public readonly isDesktop: boolean;

  public readonly os: OperatingSystem | undefined;

  public readonly isNonProduction: boolean;

  protected constructor(
    window: Partial<Window>,
    environmentVariables: IEnvironmentVariables = EnvironmentVariablesFactory.Current.instance,
    browserOsDetector: IBrowserOsDetector = new BrowserOsDetector(),
  ) {
    if (!window) {
      throw new Error('missing window');
    }
    this.isNonProduction = environmentVariables.isNonProduction;
    this.isDesktop = isDesktop(window);
    if (this.isDesktop) {
      this.os = window?.os;
    } else {
      this.os = undefined;
      const userAgent = getUserAgent(window);
      if (userAgent) {
        this.os = browserOsDetector.detect(userAgent);
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
