import { IUserFilter } from './Filter/IUserFilter';
import { IUserSelection } from './Selection/IUserSelection';
import { IApplicationCode } from './Code/IApplicationCode';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';

export interface ICategoryCollectionState {
    readonly code: IApplicationCode;
    readonly filter: IUserFilter;
    readonly selection: IUserSelection;
    readonly collection: ICategoryCollection;
    readonly os: OperatingSystem;
}
