import type { CategoryParser } from '@/application/Parser/Executable/CategoryParser';
import type { CategoryData } from '@/application/collections/';
import type { Category } from '@/domain/Executables/Category/Category';
import type { CategoryCollectionContext } from '@/application/Parser/Executable/CategoryCollectionContext';
import { CategoryStub } from './CategoryStub';

export class CategoryParserStub {
  private configuredParseResults = new Map<CategoryData, Category>();

  private usedUtilities = new Array<CategoryCollectionContext>();

  public get(): CategoryParser {
    return (category, utilities) => {
      const result = this.configuredParseResults.get(category);
      this.usedUtilities.push(utilities);
      if (result) {
        return result;
      }
      return new CategoryStub(`[${CategoryParserStub.name}]-parsed-category`);
    };
  }

  public withConfiguredParseResult(
    givenCategory: CategoryData,
    parsedCategory: Category,
  ): this {
    this.configuredParseResults.set(givenCategory, parsedCategory);
    return this;
  }

  public getUsedContext(): readonly CategoryCollectionContext[] {
    return this.usedUtilities;
  }
}
