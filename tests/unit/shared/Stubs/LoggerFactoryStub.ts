import { Logger } from '@/application/Common/Log/Logger';
import { LoggerFactory } from '@/application/Common/Log/LoggerFactory';
import { LoggerStub } from './LoggerStub';

export class LoggerFactoryStub implements LoggerFactory {
  public logger: Logger = new LoggerStub();

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }
}
