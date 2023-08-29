import { IOperatingSystemOps } from '@/infrastructure/SystemOperations/ISystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class OperatingSystemOpsStub
  extends StubWithObservableMethodCalls<IOperatingSystemOps>
  implements IOperatingSystemOps {
  private temporaryDirectory = '/stub-temp-dir/';

  public withTemporaryDirectoryResult(directory: string): this {
    this.temporaryDirectory = directory;
    return this;
  }

  public getTempDirectory(): string {
    this.registerMethodCall({
      methodName: 'getTempDirectory',
      args: [],
    });
    return this.temporaryDirectory;
  }
}
