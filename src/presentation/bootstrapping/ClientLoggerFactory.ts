import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { IRuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/IRuntimeEnvironment';
import { ConsoleLogger } from '@/infrastructure/Log/ConsoleLogger';
import { ILogger } from '@/infrastructure/Log/ILogger';
import { ILoggerFactory } from '@/infrastructure/Log/ILoggerFactory';
import { NoopLogger } from '@/infrastructure/Log/NoopLogger';
import { WindowInjectedLogger } from '@/infrastructure/Log/WindowInjectedLogger';

export class ClientLoggerFactory implements ILoggerFactory {
  public static readonly Current: ILoggerFactory = new ClientLoggerFactory();

  public readonly logger: ILogger;

  protected constructor(environment: IRuntimeEnvironment = RuntimeEnvironment.CurrentEnvironment) {
    if (environment.isDesktop) {
      this.logger = new WindowInjectedLogger();
      return;
    }
    if (environment.isNonProduction) {
      this.logger = new ConsoleLogger();
      return;
    }
    this.logger = new NoopLogger();
  }
}
