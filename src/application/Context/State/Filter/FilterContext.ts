import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { FilterResult } from './Result/FilterResult';
import { FilterChangeDetails } from './Event/FilterChangeDetails';

export interface ReadonlyFilterContext {
  readonly currentFilter: FilterResult | undefined;
  readonly filterChanged: IEventSource<FilterChangeDetails>;
}

export interface FilterContext extends ReadonlyFilterContext {
  applyFilter(filter: string): void;
  clearFilter(): void;
}
