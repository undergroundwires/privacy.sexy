import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import type { FilterResult } from '../Result/FilterResult';

export interface FilterStrategy {
  applyFilter(
    filter: string,
    collection: ICategoryCollection,
  ): FilterResult;
}
