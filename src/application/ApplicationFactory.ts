import { IApplication } from '@/domain/IApplication';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';
import { IApplicationFactory } from './IApplicationFactory';
import { parseApplication } from './Parser/ApplicationParser';

export type ApplicationGetter = () => IApplication;
const ApplicationGetter: ApplicationGetter = parseApplication;

export class ApplicationFactory implements IApplicationFactory {
  public static readonly Current: IApplicationFactory = new ApplicationFactory(ApplicationGetter);

  private readonly getter: AsyncLazy<IApplication>;

  protected constructor(costlyGetter: ApplicationGetter) {
    if (!costlyGetter) {
      throw new Error('undefined getter');
    }
    this.getter = new AsyncLazy<IApplication>(() => Promise.resolve(costlyGetter()));
  }

  public getApp(): Promise<IApplication> {
    return this.getter.getValue();
  }
}
