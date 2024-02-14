import type { ICategoryCollection } from '@/domain/ICategoryCollection';
import type { FilterResult } from '../Result/FilterResult';

export interface FilterStrategy {
  applyFilter(
    filter: string,
    collection: ICategoryCollection,
  ): FilterResult;
}
