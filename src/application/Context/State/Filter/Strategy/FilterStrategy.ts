import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { FilterResult } from '../Result/FilterResult';

export interface FilterStrategy {
  applyFilter(
    filter: string,
    collection: CategoryCollection,
  ): FilterResult;
}
