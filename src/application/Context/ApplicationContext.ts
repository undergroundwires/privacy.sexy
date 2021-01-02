import { IApplicationContext } from './IApplicationContext';
import { ICategoryCollectionState } from './State/ICategoryCollectionState';
import { CategoryCollectionState } from './State/CategoryCollectionState';
import applicationFile from 'js-yaml-loader!@/application/application.yaml';
import { parseCategoryCollection } from '../Parser/CategoryCollectionParser';
import { ICategoryCollection } from '@/domain/ICategoryCollection';


export function createContext(): IApplicationContext {
    const application = parseCategoryCollection(applicationFile);
    const context = new ApplicationContext(application);
    return context;
}

export class ApplicationContext implements IApplicationContext {
    public readonly state: ICategoryCollectionState;
    public constructor(public readonly collection: ICategoryCollection) {
        this.state = new CategoryCollectionState(collection);
    }
}
