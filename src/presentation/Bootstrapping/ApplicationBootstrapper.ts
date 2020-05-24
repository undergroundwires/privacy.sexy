import { VModalBootstrapper } from './Modules/VModalBootstrapper';
import { TreeBootstrapper } from './Modules/TreeBootstrapper';
import { IconBootstrapper } from './Modules/IconBootstrapper';
import { VueConstructor, IVueBootstrapper } from './IVueBootstrapper';
import { VueBootstrapper } from './Modules/VueBootstrapper';
import { TooltipBootstrapper } from './Modules/TooltipBootstrapper';

export class ApplicationBootstrapper implements IVueBootstrapper {
    public bootstrap(vue: VueConstructor): void {
        vue.config.productionTip = false;
        const bootstrappers = this.getAllBootstrappers();
        for (const bootstrapper of bootstrappers) {
            bootstrapper.bootstrap(vue);
        }
    }

    private getAllBootstrappers(): IVueBootstrapper[] {
        return [
            new IconBootstrapper(),
            new TreeBootstrapper(),
            new VueBootstrapper(),
            new TooltipBootstrapper(),
            new VModalBootstrapper(),
        ];
    }
}
