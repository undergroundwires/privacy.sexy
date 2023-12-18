import { OperatingSystemOps } from '@/infrastructure/CodeRunner/SystemOperations/SystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class OperatingSystemOpsStub
  extends StubWithObservableMethodCalls<OperatingSystemOps>
  implements OperatingSystemOps {
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
