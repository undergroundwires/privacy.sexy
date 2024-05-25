import type { CategoryFactory } from '@/application/Parser/CategoryParser';
import type { CategoryInitParameters } from '@/domain/Category';
import type { ICategory } from '@/domain/ICategory';
import { CategoryStub } from './CategoryStub';

export function createCategoryFactorySpy(): {
  readonly categoryFactorySpy: CategoryFactory;
  getInitParameters: (category: ICategory) => CategoryInitParameters | undefined;
} {
  const createdCategories = new Map<ICategory, CategoryInitParameters>();
  return {
    categoryFactorySpy: (parameters) => {
      const category = new CategoryStub(55);
      createdCategories.set(category, parameters);
      return category;
    },
    getInitParameters: (category) => createdCategories.get(category),
  };
}
