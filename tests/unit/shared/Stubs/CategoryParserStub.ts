import type { CategoryParser } from '@/application/Parser/Executable/CategoryParser';
import type { CategoryData } from '@/application/collections/';
import type { Category } from '@/domain/Executables/Category/Category';
import type { CategoryCollectionSpecificUtilities } from '@/application/Parser/Executable/CategoryCollectionSpecificUtilities';
import { CategoryStub } from './CategoryStub';

export class CategoryParserStub {
  private configuredParseResults = new Map<CategoryData, Category>();

  private usedUtilities = new Array<CategoryCollectionSpecificUtilities>();

  public get(): CategoryParser {
    return (category, utilities) => {
      const result = this.configuredParseResults.get(category);
      this.usedUtilities.push(utilities);
      if (result) {
        return result;
      }
      return new CategoryStub(5489);
    };
  }

  public withConfiguredParseResult(
    givenCategory: CategoryData,
    parsedCategory: Category,
  ): this {
    this.configuredParseResults.set(givenCategory, parsedCategory);
    return this;
  }

  public getUsedUtilities(): readonly CategoryCollectionSpecificUtilities[] {
    return this.usedUtilities;
  }
}
