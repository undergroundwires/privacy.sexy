import { ICategoryCollectionState } from './State/ICategoryCollectionState';
import { ICategoryCollection } from '@/domain/ICategoryCollection';

export interface IApplicationContext {
    readonly collection: ICategoryCollection;
    readonly state: ICategoryCollectionState;
}
