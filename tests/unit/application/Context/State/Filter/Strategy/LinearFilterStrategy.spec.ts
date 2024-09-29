import { describe, it, expect } from 'vitest';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';
import type { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import { LinearFilterStrategy } from '@/application/Context/State/Filter/Strategy/LinearFilterStrategy';

describe('LinearFilterStrategy', () => {
  describe('applyFilter', () => {
    describe('query', () => {
      it('returns provided filter', () => {
        // arrange
        const expectedQuery = 'non matching filter';
        const strategy = new FilterStrategyTestBuilder()
          .withFilter(expectedQuery);
        // act
        const result = strategy.applyFilter();
        // assert
        expect(result.query).to.equal(expectedQuery);
      });
    });
    describe('hasAnyMatches', () => {
      it('returns false when there are no matches', () => {
        // arrange
        const strategy = new FilterStrategyTestBuilder()
          .withFilter('non matching filter')
          .withCollection(new CategoryCollectionStub());
        // act
        const result = strategy.applyFilter();
        // assert
        expect(result.hasAnyMatches()).be.equal(false);
      });
      it('returns true for a script match', () => {
        // arrange
        const matchingFilter = 'matching filter';
        const collection = new CategoryCollectionStub()
          .withAction(
            new CategoryStub('parent-category-of-matching-script')
              .withScript(createMatchingScript(matchingFilter)),
          );
        const strategy = new FilterStrategyTestBuilder()
          .withFilter(matchingFilter)
          .withCollection(collection);
        // act
        const result = strategy.applyFilter();
        // assert
        expect(result.hasAnyMatches()).be.equal(true);
      });
      it('returns true for a category match', () => {
        // arrange
        const matchingFilter = 'matching filter';
        const collection = new CategoryCollectionStub()
          .withAction(createMatchingCategory(matchingFilter));
        const strategy = new FilterStrategyTestBuilder()
          .withFilter(matchingFilter)
          .withCollection(collection);
        // act
        const result = strategy.applyFilter();
        // assert
        expect(result.hasAnyMatches()).be.equal(true);
      });
      it('returns true for script and category matches', () => {
        // arrange
        const matchingFilter = 'matching filter';
        const collection = new CategoryCollectionStub()
          .withAction(createMatchingCategory(matchingFilter))
          .withAction(new CategoryStub('matching-script-parent').withScript(createMatchingScript(matchingFilter)));
        const strategy = new FilterStrategyTestBuilder()
          .withFilter(matchingFilter)
          .withCollection(collection);
        // act
        const result = strategy.applyFilter();
        // assert
        expect(result.hasAnyMatches()).be.equal(true);
      });
    });
    describe('scriptMatches', () => {
      it('returns empty when there are no matches', () => {
        // arrange
        const strategy = new FilterStrategyTestBuilder()
          .withFilter('non matching filter')
          .withCollection(new CategoryCollectionStub());
        // act
        const result = strategy.applyFilter();
        // assert
        expect(result.scriptMatches).to.have.lengthOf(0);
      });
      describe('returns single matching script', () => {
        interface ScriptMatchTestScenario {
          readonly description: string;
          readonly filter: string;
          readonly matchingScript: Script;
        }
        const testScenarios: readonly ScriptMatchTestScenario[] = [
          {
            description: 'case-insensitive code',
            filter: 'Hello WoRLD',
            matchingScript: new ScriptStub('id').withCode('HELLO world'),
          },
          {
            description: 'case-insensitive revert code',
            filter: 'Hello WoRLD',
            matchingScript: new ScriptStub('id').withRevertCode('HELLO world'),
          },
          {
            description: 'case-insensitive name',
            filter: 'Hello WoRLD',
            matchingScript: new ScriptStub('id').withName('HELLO world'),
          },
          {
            description: 'case-insensitive documentation',
            filter: 'MaTChing doC',
            matchingScript: new ScriptStub('id').withDocs(['unrelated docs', 'matching Docs']),
          },
        ];
        testScenarios.forEach(({
          description, filter, matchingScript,
        }) => {
          it(description, () => {
            // arrange
            const expectedMatches = [matchingScript];
            const collection = new CategoryCollectionStub()
              .withAction(new CategoryStub('matching-script-parent').withScript(matchingScript));
            const strategy = new FilterStrategyTestBuilder()
              .withFilter(filter)
              .withCollection(collection);
            // act
            const result = strategy.applyFilter();
            // assert
            expectScriptMatches(result, expectedMatches);
          });
        });
      });
      it('returns multiple matching scripts', () => {
        // arrange
        const filter = 'matching filter';
        const matchingScripts: readonly Script[] = [
          createMatchingScript(filter),
          createMatchingScript(filter),
        ];
        const expectedMatches = [...matchingScripts];
        const collection = new CategoryCollectionStub()
          .withAction(new CategoryStub('matching-scripts-parent').withScripts(...matchingScripts));
        const strategy = new FilterStrategyTestBuilder()
          .withFilter(filter)
          .withCollection(collection);
        // act
        const result = strategy.applyFilter();
        // assert
        expectScriptMatches(result, expectedMatches);
      });
    });
    describe('categoryMatches', () => {
      it('returns empty when there are no matches', () => {
        // arrange
        const strategy = new FilterStrategyTestBuilder()
          .withFilter('non matching filter')
          .withCollection(new CategoryCollectionStub());
        // act
        const result = strategy.applyFilter();
        // assert
        expect(result.categoryMatches).to.have.lengthOf(0);
      });
      describe('returns single matching category', () => {
        interface CategoryMatchTestScenario {
          readonly description: string;
          readonly filter: string;
          readonly matchingCategory: Category;
        }
        const testScenarios: readonly CategoryMatchTestScenario[] = [
          {
            description: 'match with case-insensitive name',
            filter: 'Hello WoRLD',
            matchingCategory: new CategoryStub('matching-script-parent').withName('HELLO world'),
          },
          {
            description: 'case-sensitive documentation',
            filter: 'Hello WoRLD',
            matchingCategory: new CategoryStub('matching-script-parent').withDocs(['unrelated-docs', 'HELLO world']),
          },
        ];
        testScenarios.forEach(({
          description, filter, matchingCategory,
        }) => {
          it(description, () => {
            // arrange
            const expectedMatches = [matchingCategory];
            const collection = new CategoryCollectionStub()
              .withAction(matchingCategory);
            const strategy = new FilterStrategyTestBuilder()
              .withFilter(filter)
              .withCollection(collection);
            // act
            const result = strategy.applyFilter();
            // assert
            expectCategoryMatches(result, expectedMatches);
          });
        });
      });
      it('returns multiple matching categories', () => {
        // arrange
        const filter = 'matching filter';
        const matchingCategories: readonly Category[] = [
          createMatchingCategory(filter),
          createMatchingCategory(filter),
        ];
        const expectedMatches = [...matchingCategories];
        const collection = new CategoryCollectionStub()
          .withActions(...matchingCategories);
        const strategy = new FilterStrategyTestBuilder()
          .withFilter(filter)
          .withCollection(collection);
        // act
        const result = strategy.applyFilter();
        // assert
        expectCategoryMatches(result, expectedMatches);
      });
    });
  });
});

function createMatchingScript(
  matchingFilter: string,
): ScriptStub {
  return new ScriptStub('matching-script')
    .withCode(matchingFilter)
    .withName(matchingFilter);
}

function createMatchingCategory(
  matchingFilter: string,
): CategoryStub {
  return new CategoryStub('matching-category')
    .withName(matchingFilter)
    .withDocs([matchingFilter]);
}

function expectCategoryMatches(
  actualFilter: FilterResult,
  expectedMatches: readonly Category[],
): void {
  expect(actualFilter.hasAnyMatches()).be.equal(true);
  expect(actualFilter.categoryMatches).to.have.lengthOf(expectedMatches.length);
  expect(actualFilter.categoryMatches).to.have.members(expectedMatches);
}

function expectScriptMatches(
  actualFilter: FilterResult,
  expectedMatches: readonly Script[],
): void {
  expect(actualFilter.hasAnyMatches()).be.equal(true);
  expect(actualFilter.scriptMatches).to.have.lengthOf(expectedMatches.length);
  expect(actualFilter.scriptMatches).to.have.members(expectedMatches);
}

class FilterStrategyTestBuilder {
  private filter: string = `[${FilterStrategyTestBuilder.name}]filter`;

  private collection: CategoryCollection = new CategoryCollectionStub();

  public withCollection(collection: CategoryCollection): this {
    this.collection = collection;
    return this;
  }

  public withFilter(filter: string): this {
    this.filter = filter;
    return this;
  }

  public applyFilter(): ReturnType<LinearFilterStrategy['applyFilter']> {
    const strategy = new LinearFilterStrategy();
    return strategy.applyFilter(
      this.filter,
      this.collection,
    );
  }
}
