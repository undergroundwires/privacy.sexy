import { EventSource } from '@/infrastructure/Events/EventSource';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { FilterResult } from './Result/FilterResult';
import { FilterContext } from './FilterContext';
import { FilterChangeDetails } from './Event/FilterChangeDetails';
import { FilterChange } from './Event/FilterChange';
import { FilterStrategy } from './Strategy/FilterStrategy';
import { LinearFilterStrategy } from './Strategy/LinearFilterStrategy';

export class AdaptiveFilterContext implements FilterContext {
  public readonly filterChanged = new EventSource<FilterChangeDetails>();

  public currentFilter: FilterResult | undefined;

  constructor(
    private readonly collection: ICategoryCollection,
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
