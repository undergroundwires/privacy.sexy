import { ApplicationContext } from './ApplicationContext';
import { IApplicationContext } from '@/application/Context/IApplicationContext';
import applicationFile from 'js-yaml-loader!@/application/application.yaml';
import { parseApplication } from '@/application/Parser/ApplicationParser';

export function buildContext(): IApplicationContext {
    const application = parseApplication(applicationFile);
    return new ApplicationContext(application);
}
