import { inject, type App } from 'vue';
import { buildContext } from '@/application/Context/ApplicationContextFactory';
import { provideDependencies } from '@/presentation/bootstrapping/DependencyProvider';
import { Bootstrapper } from '../Bootstrapper';

export class DependencyBootstrapper implements Bootstrapper {
  constructor(
    private readonly contextFactory = buildContext,
    private readonly dependencyProvider = provideDependencies,
    private readonly injector = inject,
  ) { }

  public async bootstrap(app: App): Promise<void> {
    const context = await this.contextFactory();
    this.dependencyProvider(context, {
      provide: app.provide,
      inject: this.injector,
    });
  }
}
