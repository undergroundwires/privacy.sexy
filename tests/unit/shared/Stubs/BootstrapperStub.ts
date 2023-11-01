import { App } from 'vue';
import { Bootstrapper } from '@/presentation/bootstrapping/Bootstrapper';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

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
