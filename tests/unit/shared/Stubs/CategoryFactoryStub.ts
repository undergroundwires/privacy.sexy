import type { Category } from '@/domain/Executables/Category/Category';
import type { CategoryFactory, CategoryInitParameters } from '@/domain/Executables/Category/CategoryFactory';
import { CategoryStub } from './CategoryStub';

export function createCategoryFactorySpy(): {
  readonly categoryFactorySpy: CategoryFactory;
  getInitParameters: (category: Category) => CategoryInitParameters | undefined;
} {
  const createdCategories = new Map<Category, CategoryInitParameters>();
  return {
    categoryFactorySpy: (parameters) => {
      const category = new CategoryStub('category-from-factory-stub');
      createdCategories.set(category, parameters);
      return category;
    },
    getInitParameters: (category) => createdCategories.get(category),
  };
}
