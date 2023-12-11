import { Bootstrapper } from './Bootstrapper';
import { RuntimeSanityValidator } from './Modules/RuntimeSanityValidator';
import { AppInitializationLogger } from './Modules/AppInitializationLogger';
import { DependencyBootstrapper } from './Modules/DependencyBootstrapper';
import { MobileSafariActivePseudoClassEnabler } from './Modules/MobileSafariActivePseudoClassEnabler';
import type { App } from 'vue';

export class ApplicationBootstrapper implements Bootstrapper {
  constructor(private readonly bootstrappers = ApplicationBootstrapper.getAllBootstrappers()) { }

  public async bootstrap(app: App): Promise<void> {
    for (const bootstrapper of this.bootstrappers) {
      // eslint-disable-next-line no-await-in-loop
      await bootstrapper.bootstrap(app); // Not running `Promise.all` because order matters.
    }
  }

  private static getAllBootstrappers(): Bootstrapper[] {
    return [
      new RuntimeSanityValidator(),
      new DependencyBootstrapper(),
      new AppInitializationLogger(),
      new MobileSafariActivePseudoClassEnabler(),
    ];
  }
}
