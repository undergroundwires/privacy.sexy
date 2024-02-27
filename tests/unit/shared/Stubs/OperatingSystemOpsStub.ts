import type { OperatingSystemOps } from '@/infrastructure/CodeRunner/System/SystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class OperatingSystemOpsStub
  extends StubWithObservableMethodCalls<OperatingSystemOps>
  implements OperatingSystemOps {
  private userDataDirectory = `/${OperatingSystemOpsStub.name}-user-data-dir/`;

  public withUserDirectoryResult(directory: string): this {
    this.userDataDirectory = directory;
    return this;
  }

  public getUserDataDirectory(): string {
    this.registerMethodCall({
      methodName: 'getUserDataDirectory',
      args: [],
    });
    return this.userDataDirectory;
  }
}
