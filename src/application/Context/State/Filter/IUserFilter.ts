import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { IFilterResult } from './IFilterResult';
import { IFilterChangeDetails } from './Event/IFilterChangeDetails';

export interface IReadOnlyUserFilter {
  readonly currentFilter: IFilterResult | undefined;
  readonly filterChanged: IEventSource<IFilterChangeDetails>;
}

export interface IUserFilter extends IReadOnlyUserFilter {
  applyFilter(filter: string): void;
  clearFilter(): void;
}
