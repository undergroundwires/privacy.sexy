import type { ApplicationProvider } from '@/application/Application/ApplicationProvider';
import type { Application } from '@/domain/Application/Application';
import { ApplicationStub } from './ApplicationStub';

export class ApplicationProviderStub {
  private application: Application = new ApplicationStub();

  public withApp(app: Application): this {
    this.application = app;
    return this;
  }

  public provider: ApplicationProvider = () => Promise.resolve(this.application);
}
