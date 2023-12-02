import { Logger } from '@/application/Common/Log/Logger';
import { Bootstrapper } from '../Bootstrapper';
import { ClientLoggerFactory } from '../ClientLoggerFactory';

export class AppInitializationLogger implements Bootstrapper {
  constructor(
    private readonly logger: Logger = ClientLoggerFactory.Current.logger,
  ) { }

  public async bootstrap(): Promise<void> {
    // Do not remove [APP_INIT]; it's a marker used in tests.
    this.logger.info('[APP_INIT] Application is initialized.');
  }
}
