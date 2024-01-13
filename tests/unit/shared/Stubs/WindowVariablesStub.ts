import { OperatingSystem } from '@/domain/OperatingSystem';
import { Logger } from '@/application/Common/Log/Logger';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { CodeRunner } from '@/application/CodeRunner/CodeRunner';
import { Dialog } from '@/presentation/common/Dialog';
import { LoggerStub } from './LoggerStub';
import { CodeRunnerStub } from './CodeRunnerStub';
import { DialogStub } from './DialogStub';

export class WindowVariablesStub implements WindowVariables {
  public codeRunner?: CodeRunner = new CodeRunnerStub();

  public isRunningAsDesktopApplication: true | undefined = true;

  public os?: OperatingSystem = OperatingSystem.BlackBerryOS;

  public log?: Logger = new LoggerStub();

  public dialog?: Dialog = new DialogStub();

  public withLog(log: Logger): this {
    this.log = log;
    return this;
  }

  public withDialog(dialog: Dialog): this {
    this.dialog = dialog;
    return this;
  }

  public withIsRunningAsDesktopApplication(isRunningAsDesktopApplication: true | undefined): this {
    this.isRunningAsDesktopApplication = isRunningAsDesktopApplication;
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
