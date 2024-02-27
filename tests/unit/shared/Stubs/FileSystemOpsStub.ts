import type { FileSystemOps } from '@/infrastructure/CodeRunner/System/SystemOperations';
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
}
