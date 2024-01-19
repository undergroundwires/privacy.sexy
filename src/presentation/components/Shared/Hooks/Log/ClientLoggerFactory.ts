import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { ConsoleLogger } from '@/infrastructure/Log/ConsoleLogger';
import { Logger } from '@/application/Common/Log/Logger';
import { NoopLogger } from '@/infrastructure/Log/NoopLogger';
import { WindowInjectedLogger } from '@/infrastructure/Log/WindowInjectedLogger';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { LoggerFactory } from './LoggerFactory';

export class ClientLoggerFactory implements LoggerFactory {
  public static readonly Current: LoggerFactory = new ClientLoggerFactory();

  public readonly logger: Logger;

  protected constructor(
    environment: RuntimeEnvironment = CurrentEnvironment,
    windowAccessor: WindowAccessor = () => globalThis.window,
    noopLoggerFactory: LoggerCreationFunction = () => new NoopLogger(),
    windowInjectedLoggerFactory: LoggerCreationFunction = () => new WindowInjectedLogger(),
    consoleLoggerFactory: LoggerCreationFunction = () => new ConsoleLogger(),
  ) {
    if (isUnitOrIntegrationTests(environment, windowAccessor)) {
      this.logger = noopLoggerFactory(); // keep the test outputs clean
      return;
    }
    if (environment.isRunningAsDesktopApplication) {
      this.logger = windowInjectedLoggerFactory();
      return;
    }
    if (environment.isNonProduction) {
      this.logger = consoleLoggerFactory();
      return;
    }
    this.logger = noopLoggerFactory();
  }
}

export type WindowAccessor = () => OptionalWindow;

export type LoggerCreationFunction = () => Logger;

type OptionalWindow = Window | undefined | null;

function isUnitOrIntegrationTests(
  environment: RuntimeEnvironment,
  windowAccessor: WindowAccessor,
): boolean {
  /*
    In a desktop application context, Electron preloader process inject a logger into
    the global window object. If we're in a desktop (Node) environment and the logger isn't
    injected, it indicates a testing environment.
  */
  return environment.isRunningAsDesktopApplication && !windowAccessor()?.log;
}
