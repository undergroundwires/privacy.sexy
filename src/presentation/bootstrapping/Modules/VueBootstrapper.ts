import { VueConstructor, IVueBootstrapper } from '../IVueBootstrapper';

export class VueBootstrapper implements IVueBootstrapper {
  public bootstrap(vue: VueConstructor): void {
    const { config } = vue;
    config.productionTip = false;
  }
}
