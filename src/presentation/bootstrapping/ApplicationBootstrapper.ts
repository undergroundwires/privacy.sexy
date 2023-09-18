import { IconBootstrapper } from './Modules/IconBootstrapper';
import { VueConstructor, IVueBootstrapper } from './IVueBootstrapper';
import { VueBootstrapper } from './Modules/VueBootstrapper';
import { RuntimeSanityValidator } from './Modules/RuntimeSanityValidator';
import { AppInitializationLogger } from './Modules/AppInitializationLogger';

export class ApplicationBootstrapper implements IVueBootstrapper {
  public bootstrap(vue: VueConstructor): void {
    const bootstrappers = ApplicationBootstrapper.getAllBootstrappers();
    for (const bootstrapper of bootstrappers) {
      bootstrapper.bootstrap(vue);
    }
  }

  private static getAllBootstrappers(): IVueBootstrapper[] {
    return [
      new IconBootstrapper(),
      new VueBootstrapper(),
      new RuntimeSanityValidator(),
      new AppInitializationLogger(),
    ];
  }
}
