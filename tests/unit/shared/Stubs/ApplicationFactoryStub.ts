import type { Application } from '@/domain/Application/Application';
import type { ApplicationFactory, ApplicationInitParameters } from '@/domain/Application/ApplicationFactory';
import { ApplicationStub } from './ApplicationStub';

export function createApplicationFactorySpy(): {
  readonly applicationFactory: ApplicationFactory;
  getInitParameters: (application: Application) => ApplicationInitParameters | undefined;
} {
  const createdApps = new Map<Application, ApplicationInitParameters>();
  return {
    applicationFactory: (parameters) => {
      const application = new ApplicationStub();
      createdApps.set(application, parameters);
      return application;
    },
    getInitParameters: (script) => createdApps.get(script),
  };
}
