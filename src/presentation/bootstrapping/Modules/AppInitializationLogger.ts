import type { Logger } from '@/application/Common/Log/Logger';
import { ClientLoggerFactory } from '@/presentation/components/Shared/Hooks/Log/ClientLoggerFactory';
import type { Bootstrapper } from '../Bootstrapper';

export class AppInitializationLogger implements Bootstrapper {
  constructor(
    private readonly logger: Logger = ClientLoggerFactory.Current.logger,
  ) { }

  public async bootstrap(): Promise<void> {
    // Do not remove [APP_INIT]; it's a marker used in tests.
    this.logger.info('[APP_INIT] Application is initialized.');
  }
}
