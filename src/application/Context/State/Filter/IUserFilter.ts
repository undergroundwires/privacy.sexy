import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { IFilterResult } from './IFilterResult';

export interface IUserFilter {
    readonly currentFilter: IFilterResult | undefined;
    readonly filtered: IEventSource<IFilterResult>;
    readonly filterRemoved: IEventSource<void>;
    setFilter(filter: string): void;
    removeFilter(): void;
}
