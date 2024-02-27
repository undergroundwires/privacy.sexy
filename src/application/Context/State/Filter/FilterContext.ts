import type { IEventSource } from '@/infrastructure/Events/IEventSource';
import type { FilterResult } from './Result/FilterResult';
import type { FilterChangeDetails } from './Event/FilterChangeDetails';

export interface ReadonlyFilterContext {
  readonly currentFilter: FilterResult | undefined;
  readonly filterChanged: IEventSource<FilterChangeDetails>;
}

export interface FilterContext extends ReadonlyFilterContext {
  applyFilter(filter: string): void;
  clearFilter(): void;
}
