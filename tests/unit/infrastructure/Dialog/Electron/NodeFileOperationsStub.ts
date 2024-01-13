import { NodeFileOperations } from '@/infrastructure/Dialog/Electron/NodeElectronSaveFileDialog';
import { StubWithObservableMethodCalls } from '@tests/unit/shared/Stubs/StubWithObservableMethodCalls';

export class NodeFileOperationsStub
  extends StubWithObservableMethodCalls<NodeFileOperations>
  implements NodeFileOperations {
  private pathSegmentSeparator = `[${NodeFileOperationsStub.name} path segment separator]`;

  public join(...paths: string[]): string {
    this.registerMethodCall({
      methodName: 'join',
      args: [...paths],
    });
    return paths.join(this.pathSegmentSeparator);
  }

  public writeFile(file: string, data: string): Promise<void> {
    this.registerMethodCall({
      methodName: 'writeFile',
      args: [file, data],
    });
    return Promise.resolve();
  }

  public withPathSegmentSeparator(pathSegmentSeparator: string): this {
    this.pathSegmentSeparator = pathSegmentSeparator;
    return this;
  }
}
