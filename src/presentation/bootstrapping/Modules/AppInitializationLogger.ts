import { ILogger } from '@/infrastructure/Log/ILogger';
import { IVueBootstrapper } from '../IVueBootstrapper';
import { ClientLoggerFactory } from '../ClientLoggerFactory';

export class AppInitializationLogger implements IVueBootstrapper {
  constructor(
    private readonly logger: ILogger = ClientLoggerFactory.Current.logger,
  ) { }

  public bootstrap(): void {
    // Do not remove [APP_INIT]; it's a marker used in tests.
    this.logger.info('[APP_INIT] Application is initialized.');
  }
}
