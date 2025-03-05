import type { IApplicationContext } from '@/application/Context/IApplicationContext';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { Application } from '@/domain/Application/Application';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { createOrGetApplication } from '../Application/LazySingletonApplicationProvider';
import { ApplicationContext } from './ApplicationContext';
import type { ApplicationProvider } from '../Application/ApplicationProvider';

export async function buildContext(
  provideApp: ApplicationProvider = createOrGetApplication,
  environment = CurrentEnvironment,
): Promise<IApplicationContext> {
  const app = await provideApp();
  const os = getInitialOs(app, environment.os);
  return new ApplicationContext(app, os);
}

function getInitialOs(
  app: Application,
  currentOs: OperatingSystem | undefined,
): OperatingSystem {
  const supportedOsList = app.getSupportedOsList();
  if (currentOs !== undefined && supportedOsList.includes(currentOs)) {
    return currentOs;
  }
  return getMostSupportedOs(supportedOsList, app);
}

function getMostSupportedOs(supportedOsList: OperatingSystem[], app: Application) {
  supportedOsList.sort((os1, os2) => {
    const getPriority = (os: OperatingSystem) => app.getCollection(os).totalScripts;
    return getPriority(os2) - getPriority(os1);
  });
  return supportedOsList[0];
}
