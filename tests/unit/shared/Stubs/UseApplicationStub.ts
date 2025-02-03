import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import type { Application } from '@/domain/Application/Application';
import { ApplicationStub } from './ApplicationStub';

export class UseApplicationStub {
  private application: Application = new ApplicationStub();

  public withState(application: Application) {
    this.application = application;
    return this;
  }

  public get(): ReturnType<typeof useApplication> {
    return {
      application: this.application,
      projectDetails: this.application.projectDetails,
    };
  }
}
