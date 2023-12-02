import { Logger } from '@/application/Common/Log/Logger';

export interface LoggerFactory {
  readonly logger: Logger;
}
