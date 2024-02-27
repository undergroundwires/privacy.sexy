import type { IApplication } from '@/domain/IApplication';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';
import { parseApplication } from './Parser/ApplicationParser';
import type { IApplicationFactory } from './IApplicationFactory';

export type ApplicationGetterType = () => IApplication;
const ApplicationGetter: ApplicationGetterType = parseApplication;

export class ApplicationFactory implements IApplicationFactory {
  public static readonly Current: IApplicationFactory = new ApplicationFactory(ApplicationGetter);

  private readonly getter: AsyncLazy<IApplication>;

  protected constructor(costlyGetter: ApplicationGetterType) {
    this.getter = new AsyncLazy<IApplication>(() => Promise.resolve(costlyGetter()));
  }

  public getApp(): Promise<IApplication> {
    return this.getter.getValue();
  }
}
