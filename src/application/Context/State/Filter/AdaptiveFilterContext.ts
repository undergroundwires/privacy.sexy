import { EventSource } from '@/infrastructure/Events/EventSource';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { FilterChange } from './Event/FilterChange';
import { LinearFilterStrategy } from './Strategy/LinearFilterStrategy';
import type { FilterResult } from './Result/FilterResult';
import type { FilterContext } from './FilterContext';
import type { FilterChangeDetails } from './Event/FilterChangeDetails';
import type { FilterStrategy } from './Strategy/FilterStrategy';

export class AdaptiveFilterContext implements FilterContext {
  public readonly filterChanged = new EventSource<FilterChangeDetails>();

  public currentFilter: FilterResult | undefined;

  constructor(
    private readonly collection: CategoryCollection,
    private readonly filterStrategy: FilterStrategy = new LinearFilterStrategy(),
  ) {

  }

  public applyFilter(filter: string): void {
    if (!filter) {
      throw new Error('Filter must be defined and not empty. Use clearFilter() to remove the filter');
    }
    const result = this.filterStrategy.applyFilter(filter, this.collection);
    this.currentFilter = result;
    this.filterChanged.notify(FilterChange.forApply(this.currentFilter));
  }

  public clearFilter(): void {
    this.currentFilter = undefined;
    this.filterChanged.notify(FilterChange.forClear());
  }
}
