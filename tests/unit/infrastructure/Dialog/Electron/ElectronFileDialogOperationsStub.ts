import type { ElectronFileDialogOperations } from '@/infrastructure/Dialog/Electron/NodeElectronSaveFileDialog';
import { StubWithObservableMethodCalls } from '@tests/unit/shared/Stubs/StubWithObservableMethodCalls';

export class ElectronFileDialogOperationsStub
  extends StubWithObservableMethodCalls<ElectronFileDialogOperations>
  implements ElectronFileDialogOperations {
  private mimicUserCancel = false;

  private userDownloadsPath = `[${ElectronFileDialogOperationsStub.name}] downloads path`;

  private userSelectedFilePath = `${ElectronFileDialogOperationsStub.name} user selected file path`;

  public withMimicUserCancel(isCancelled: boolean): this {
    this.mimicUserCancel = isCancelled;
    return this;
  }

  public withUserDownloadsPath(userDownloadsPath: string): this {
    this.userDownloadsPath = userDownloadsPath;
    return this;
  }

  public withUserSelectedFilePath(userSelectedFilePath: string): this {
    this.userSelectedFilePath = userSelectedFilePath;
    return this;
  }

  public getUserDownloadsPath(): string {
    return this.userDownloadsPath;
  }

  public showSaveDialog(
    options: Electron.SaveDialogOptions,
  ): Promise<Electron.SaveDialogReturnValue> {
    this.registerMethodCall({
      methodName: 'showSaveDialog',
      args: [options],
    });
    const returnValue: Electron.SaveDialogReturnValue = {
      canceled: this.mimicUserCancel,
      filePath: this.userSelectedFilePath,
    };
    return Promise.resolve(returnValue);
  }
}
