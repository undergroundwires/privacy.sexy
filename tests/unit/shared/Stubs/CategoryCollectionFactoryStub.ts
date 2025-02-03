import type { CategoryCollectionFactory, CategoryCollectionInitParameters } from '@/domain/Collection/CategoryCollectionFactory';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { CategoryCollectionStub } from './CategoryCollectionStub';

export function createCategoryCollectionFactorySpy(): {
  readonly categoryCollectionFactorySpy: CategoryCollectionFactory;
  getInitParameters: (
    category: CategoryCollection,
  ) => CategoryCollectionInitParameters | undefined;
} {
  const createdCategoryCollections = new Map<
  CategoryCollection, CategoryCollectionInitParameters
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
