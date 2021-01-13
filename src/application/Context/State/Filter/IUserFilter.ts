import { ISignal } from '@/infrastructure/Events/ISignal';
import { IFilterResult } from './IFilterResult';

export interface IUserFilter {
    readonly currentFilter: IFilterResult | undefined;
    readonly filtered: ISignal<IFilterResult>;
    readonly filterRemoved: ISignal<void>;
    setFilter(filter: string): void;
    removeFilter(): void;
}
