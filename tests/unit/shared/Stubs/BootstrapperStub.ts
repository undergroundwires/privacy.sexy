import type { Bootstrapper } from '@/presentation/bootstrapping/Bootstrapper';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';
import type { App } from 'vue';

export class BootstrapperStub
  extends StubWithObservableMethodCalls<Bootstrapper>
  implements Bootstrapper {
  async bootstrap(app: App): Promise<void> {
    this.registerMethodCall({
      methodName: 'bootstrap',
      args: [app],
    });
  }
}
