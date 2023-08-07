import { ApplicationFactory } from '@/application/ApplicationFactory';
import { IApplication } from '@/domain/IApplication';

/* Application is always static */
let cachedApplication: IApplication;

// Running tests through Vue CLI throws 'Top-level-await is only supported in EcmaScript Modules'
// This is a temporary workaround until migrating to Vite
ApplicationFactory.Current.getApp().then((app) => {
  cachedApplication = app;
});

export function useApplication(application: IApplication = cachedApplication) {
  return {
    application,
    info: application.info,
  };
}
