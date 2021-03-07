import { VueConstructor, IVueBootstrapper } from './../IVueBootstrapper';

export class VueBootstrapper implements IVueBootstrapper {
    public bootstrap(vue: VueConstructor): void {
        vue.config.productionTip = false;
    }
}
