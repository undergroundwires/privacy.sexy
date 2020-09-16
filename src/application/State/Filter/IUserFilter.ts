import { IFilterResult } from './IFilterResult';
import { ISignal } from '@/infrastructure/Events/Signal';

export interface IUserFilter {
    readonly currentFilter: IFilterResult | undefined;
    readonly filtered: ISignal<IFilterResult>;
    readonly filterRemoved: ISignal<void>;
    setFilter(filter: string): void;
    removeFilter(): void;
}
