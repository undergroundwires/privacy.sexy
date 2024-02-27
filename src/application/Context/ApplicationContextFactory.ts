import type { IApplicationContext } from '@/application/Context/IApplicationContext';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { IApplication } from '@/domain/IApplication';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';
import { ApplicationFactory } from '../ApplicationFactory';
import { ApplicationContext } from './ApplicationContext';
import type { IApplicationFactory } from '../IApplicationFactory';

export async function buildContext(
  factory: IApplicationFactory = ApplicationFactory.Current,
  environment = CurrentEnvironment,
): Promise<IApplicationContext> {
  const app = await factory.getApp();
  const os = getInitialOs(app, environment.os);
  return new ApplicationContext(app, os);
}

function getInitialOs(
  app: IApplication,
  currentOs: OperatingSystem | undefined,
): OperatingSystem {
  const supportedOsList = app.getSupportedOsList();
  if (currentOs !== undefined && supportedOsList.includes(currentOs)) {
    return currentOs;
  }
  return getMostSupportedOs(supportedOsList, app);
}

function getMostSupportedOs(supportedOsList: OperatingSystem[], app: IApplication) {
  supportedOsList.sort((os1, os2) => {
    const getPriority = (os: OperatingSystem) => app.getCollection(os).totalScripts;
    return getPriority(os2) - getPriority(os1);
  });
  return supportedOsList[0];
}
