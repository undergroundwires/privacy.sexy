import { OperatingSystem } from '@/domain/OperatingSystem';
import { Logger } from '@/application/Common/Log/Logger';
import { ISystemOperations } from '@/infrastructure/SystemOperations/ISystemOperations';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { SystemOperationsStub } from './SystemOperationsStub';
import { LoggerStub } from './LoggerStub';

export class WindowVariablesStub implements WindowVariables {
  public system?: ISystemOperations = new SystemOperationsStub();

  public isDesktop = false;

  public os?: OperatingSystem = OperatingSystem.BlackBerryOS;

  public log: Logger = new LoggerStub();

  public withLog(log: Logger): this {
    this.log = log;
    return this;
  }

  public withIsDesktop(value: boolean): this {
    this.isDesktop = value;
    return this;
  }

  public withOs(value: OperatingSystem | undefined): this {
    this.os = value;
    return this;
  }

  public withSystem(value?: ISystemOperations): this {
    this.system = value;
    return this;
  }
}
