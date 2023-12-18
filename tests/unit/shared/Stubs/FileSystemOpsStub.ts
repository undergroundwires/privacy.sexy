import { FileSystemOps } from '@/infrastructure/CodeRunner/SystemOperations/SystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class FileSystemOpsStub
  extends StubWithObservableMethodCalls<FileSystemOps>
  implements FileSystemOps {
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
