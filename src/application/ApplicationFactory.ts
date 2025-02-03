import type { Application } from '@/domain/Application/Application';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';
import { parseApplication } from './Parser/ApplicationParser';
import type { IApplicationFactory } from './IApplicationFactory';

export type ApplicationGetterType = () => Application;
const ApplicationGetter: ApplicationGetterType = parseApplication;

export class ApplicationFactory implements IApplicationFactory {
  public static readonly Current: IApplicationFactory = new ApplicationFactory(ApplicationGetter);

  private readonly getter: AsyncLazy<Application>;

  protected constructor(costlyGetter: ApplicationGetterType) {
    this.getter = new AsyncLazy<Application>(() => Promise.resolve(costlyGetter()));
  }

  public getApp(): Promise<Application> {
    return this.getter.getValue();
  }
}
