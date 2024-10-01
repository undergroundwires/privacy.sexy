import type { CategoryCollectionFactory } from '@/application/Parser/CategoryCollectionParser';
import type { CategoryCollectionInitParameters } from '@/domain/Collection/CategoryCollection';
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import { CategoryCollectionStub } from './CategoryCollectionStub';

export function createCategoryCollectionFactorySpy(): {
  readonly categoryCollectionFactorySpy: CategoryCollectionFactory;
  getInitParameters: (
    category: ICategoryCollection,
  ) => CategoryCollectionInitParameters | undefined;
} {
  const createdCategoryCollections = new Map<
  ICategoryCollection, CategoryCollectionInitParameters
  >();
  return {
    categoryCollectionFactorySpy: (parameters) => {
      const categoryCollection = new CategoryCollectionStub();
      createdCategoryCollections.set(categoryCollection, parameters);
      return categoryCollection;
    },
    getInitParameters: (category) => createdCategoryCollections.get(category),
  };
}
