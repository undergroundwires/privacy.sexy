import { ApplicationContext } from './ApplicationContext';
import { IApplicationContext } from '@/application/Context/IApplicationContext';
import applicationFile from 'js-yaml-loader!@/application/application.yaml';
import { parseCategoryCollection } from '@/application/Parser/CategoryCollectionParser';

export function buildContext(): IApplicationContext {
    const application = parseCategoryCollection(applicationFile);
    return new ApplicationContext(application);
}
