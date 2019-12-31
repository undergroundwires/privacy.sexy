import { VueConstructor, IVueBootstrapper } from '../IVueBootstrapper';
import VTooltip from 'v-tooltip';

export class TooltipBootstrapper implements IVueBootstrapper {
    public bootstrap(vue: VueConstructor): void {
        vue.use(VTooltip);
    }
}
