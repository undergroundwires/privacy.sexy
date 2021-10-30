import { ApplicationContext } from './ApplicationContext';
import { IApplicationContext } from '@/application/Context/IApplicationContext';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { Environment } from '../Environment/Environment';
import { IApplication } from '@/domain/IApplication';
import { IEnvironment } from '../Environment/IEnvironment';
import { IApplicationFactory } from '../IApplicationFactory';
import { ApplicationFactory } from '../ApplicationFactory';

export async function buildContext(
    factory: IApplicationFactory = ApplicationFactory.Current,
    environment = Environment.CurrentEnvironment): Promise<IApplicationContext> {
    if (!factory) { throw new Error('undefined factory'); }
    if (!environment) { throw new Error('undefined environment'); }
    const app = await factory.getApp();
    const os = getInitialOs(app, environment);
    return new ApplicationContext(app, os);
}

function getInitialOs(app: IApplication, environment: IEnvironment): OperatingSystem {
    const currentOs = environment.os;
    const supportedOsList = app.getSupportedOsList();
    if (supportedOsList.includes(currentOs)) {
        return currentOs;
    }
    supportedOsList.sort((os1, os2) => {
        const getPriority = (os: OperatingSystem) => app.getCollection(os).totalScripts;
        return getPriority(os2) - getPriority(os1);
    });
    return supportedOsList[0];
}
