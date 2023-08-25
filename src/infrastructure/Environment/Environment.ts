import { OperatingSystem } from '@/domain/OperatingSystem';
import { ISystemOperations } from '@/infrastructure/Environment/SystemOperations/ISystemOperations';
import { BrowserOsDetector } from './BrowserOs/BrowserOsDetector';
import { IBrowserOsDetector } from './BrowserOs/IBrowserOsDetector';
import { IEnvironment } from './IEnvironment';
import { WindowVariables } from './WindowVariables';
import { validateWindowVariables } from './WindowVariablesValidator';

export class Environment implements IEnvironment {
  public static readonly CurrentEnvironment: IEnvironment = new Environment(window);

  public readonly isDesktop: boolean;

  public readonly os: OperatingSystem | undefined;

  public readonly system: ISystemOperations | undefined;

  protected constructor(
    window: Partial<Window>,
    browserOsDetector: IBrowserOsDetector = new BrowserOsDetector(),
    windowValidator: WindowValidator = validateWindowVariables,
  ) {
    if (!window) {
      throw new Error('missing window');
    }
    windowValidator(window);
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
    this.system = window?.system;
  }
}

function getUserAgent(window: Partial<Window>): string {
  return window?.navigator?.userAgent;
}

function isDesktop(window: Partial<WindowVariables>): boolean {
  return window?.isDesktop === true;
}

export type WindowValidator = typeof validateWindowVariables;
