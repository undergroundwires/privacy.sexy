import VTooltip from 'v-tooltip';
import { VueConstructor, IVueBootstrapper } from '../IVueBootstrapper';

export class TooltipBootstrapper implements IVueBootstrapper {
  public bootstrap(vue: VueConstructor): void {
    vue.use(VTooltip);
  }
}
