import type { ApplicationLoader } from '@/application/Application/Loader/ApplicationLoader';
import type { Application } from '@/domain/Application/Application';
import { ApplicationStub } from './ApplicationStub';

export class ApplicationLoaderStub {
  public totalCalls = 0;

  private application: Application = new ApplicationStub();

  public withApplicationResult(application: Application): this {
    this.application = application;
    return this;
  }

  public getStub(): ApplicationLoader {
    return () => {
      this.totalCalls++;
      return this.application;
    };
  }
}
