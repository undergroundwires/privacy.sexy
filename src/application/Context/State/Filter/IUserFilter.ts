import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { IFilterResult } from './IFilterResult';

export interface IReadOnlyUserFilter {
  readonly currentFilter: IFilterResult | undefined;
  readonly filtered: IEventSource<IFilterResult>;
  readonly filterRemoved: IEventSource<void>;
}

export interface IUserFilter extends IReadOnlyUserFilter {
  setFilter(filter: string): void;
  removeFilter(): void;
}
