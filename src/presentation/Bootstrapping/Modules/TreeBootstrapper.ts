import LiquorTree from 'liquor-tree';
import { VueConstructor, IVueBootstrapper } from './../IVueBootstrapper';

export class TreeBootstrapper implements IVueBootstrapper {
    public bootstrap(vue: VueConstructor): void {
        vue.use(LiquorTree);
    }
}
