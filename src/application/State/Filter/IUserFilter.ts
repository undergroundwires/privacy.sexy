import { IFilterMatches } from './IFilterMatches';
import { ISignal } from '@/infrastructure/Events/Signal';

export interface IUserFilter {
    readonly filtered: ISignal<IFilterMatches>;
    readonly filterRemoved: ISignal<void>;
    setFilter(filter: string): void;
    removeFilter(): void;
}
