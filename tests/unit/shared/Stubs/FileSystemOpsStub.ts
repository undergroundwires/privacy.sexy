import { IFileSystemOps } from '@/infrastructure/SystemOperations/ISystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class FileSystemOpsStub
  extends StubWithObservableMethodCalls<IFileSystemOps>
  implements IFileSystemOps {
  public setFilePermissions(filePath: string, mode: string | number): Promise<void> {
    this.registerMethodCall({
      methodName: 'setFilePermissions',
      args: [filePath, mode],
    });
    return Promise.resolve();
  }

  public createDirectory(directoryPath: string, isRecursive?: boolean): Promise<void> {
    this.registerMethodCall({
      methodName: 'createDirectory',
      args: [directoryPath, isRecursive],
    });
    return Promise.resolve();
  }

  public writeToFile(filePath: string, data: string): Promise<void> {
    this.registerMethodCall({
      methodName: 'writeToFile',
      args: [filePath, data],
    });
    return Promise.resolve();
  }
}
