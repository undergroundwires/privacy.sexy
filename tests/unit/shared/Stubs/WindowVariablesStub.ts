import { OperatingSystem } from '@/domain/OperatingSystem';
import { Logger } from '@/application/Common/Log/Logger';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { CodeRunner } from '@/application/CodeRunner';
import { LoggerStub } from './LoggerStub';
import { CodeRunnerStub } from './CodeRunnerStub';

export class WindowVariablesStub implements WindowVariables {
  public codeRunner?: CodeRunner = new CodeRunnerStub();

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

  public withCodeRunner(value?: CodeRunner): this {
    this.codeRunner = value;
    return this;
  }
}
