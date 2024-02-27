import type { NodePathOperations } from '@/infrastructure/Dialog/Electron/NodeElectronSaveFileDialog';
import { StubWithObservableMethodCalls } from '@tests/unit/shared/Stubs/StubWithObservableMethodCalls';

export class NodePathOperationsStub
  extends StubWithObservableMethodCalls<NodePathOperations>
  implements NodePathOperations {
  private pathSegmentSeparator = `[${NodePathOperationsStub.name} path segment separator]`;

  public join(...paths: string[]): string {
    this.registerMethodCall({
      methodName: 'join',
      args: [...paths],
    });
    return paths.join(this.pathSegmentSeparator);
  }

  public withPathSegmentSeparator(pathSegmentSeparator: string): this {
    this.pathSegmentSeparator = pathSegmentSeparator;
    return this;
  }
}
