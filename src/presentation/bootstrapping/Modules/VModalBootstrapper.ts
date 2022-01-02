import VModal from 'vue-js-modal';
import { VueConstructor, IVueBootstrapper } from '../IVueBootstrapper';

export class VModalBootstrapper implements IVueBootstrapper {
  public bootstrap(vue: VueConstructor): void {
    vue.use(VModal, { dynamic: true, injectModalsContainer: true });
  }
}
