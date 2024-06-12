import type { CategoryFactory } from '@/application/Parser/Executable/CategoryParser';
import type { CategoryInitParameters } from '@/domain/Executables/Category/CollectionCategory';
import type { Category } from '@/domain/Executables/Category/Category';
import { CategoryStub } from './CategoryStub';

export function createCategoryFactorySpy(): {
  readonly categoryFactorySpy: CategoryFactory;
  getInitParameters: (category: Category) => CategoryInitParameters | undefined;
} {
  const createdCategories = new Map<Category, CategoryInitParameters>();
  return {
    categoryFactorySpy: (parameters) => {
      const category = new CategoryStub(55);
      createdCategories.set(category, parameters);
      return category;
    },
    getInitParameters: (category) => createdCategories.get(category),
  };
}
