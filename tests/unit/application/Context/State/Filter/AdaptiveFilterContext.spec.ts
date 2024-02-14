import { describe, it, expect } from 'vitest';
import { FilterChangeDetailsStub } from '@tests/unit/shared/Stubs/FilterChangeDetailsStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { FilterChangeDetails } from '@/application/Context/State/Filter/Event/FilterChangeDetails';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { AdaptiveFilterContext } from '@/application/Context/State/Filter/AdaptiveFilterContext';
import { FilterResultStub } from '@tests/unit/shared/Stubs/FilterResultStub';
import { FilterStrategyStub } from '@tests/unit/shared/Stubs/FilterStrategyStub';
import type { FilterStrategy } from '@/application/Context/State/Filter/Strategy/FilterStrategy';
import { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import { ICategoryCollection } from '@/domain/ICategoryCollection';

describe('AdaptiveFilterContext', () => {
  describe('clearFilter', () => {
    it('emits clear event on filter removal', () => {
      // arrange
      const expectedChange = FilterChangeDetailsStub.forClear();
      let actualChange: FilterChangeDetails | undefined;
      const context = new ContextBuilder().build();
      context.filterChanged.on((change) => {
        actualChange = change;
      });
      // act
      context.clearFilter();
      // assert
      expectExists(actualChange);
      expect(actualChange).to.deep.equal(expectedChange);
    });
    it('clears current filter', () => {
      // arrange
      const context = new ContextBuilder().build();
      // act
      context.applyFilter('non-important');
      context.clearFilter();
      // assert
      expect(context.currentFilter).to.be.equal(undefined);
    });
  });
  describe('applyFilter', () => {
    it('updates current filter correctly', () => {
      // arrange
      const expectedFilter = new FilterResultStub();
      const strategy = new FilterStrategyStub()
        .withApplyFilterResult(expectedFilter);
      const context = new ContextBuilder()
        .withStrategy(strategy)
        .build();
      // act
      context.applyFilter('non-important');
      // assert
      const actualFilter = context.currentFilter;
      expect(actualFilter).to.equal(expectedFilter);
    });
    it('emits apply event with correct filter', () => {
      // arrange
      const expectedFilter = new FilterResultStub();
      const strategy = new FilterStrategyStub()
        .withApplyFilterResult(expectedFilter);
      const context = new ContextBuilder()
        .withStrategy(strategy)
        .build();
      let actualFilter: FilterResult | undefined;
      context.filterChanged.on((filterResult) => {
        filterResult.visit({
          onApply: (result) => {
            actualFilter = result;
          },
        });
      });
      // act
      context.applyFilter('non-important');
      // assert
      expect(actualFilter).to.equal(expectedFilter);
    });
    it('applies filter using current collection', () => {
      // arrange
      const expectedCollection = new CategoryCollectionStub();
      const strategy = new FilterStrategyStub();
      const context = new ContextBuilder()
        .withStrategy(strategy)
        .withCategoryCollection(expectedCollection)
        .build();
      // act
      context.applyFilter('non-important');
      // assert
      const applyFilterCalls = strategy.callHistory.filter((c) => c.methodName === 'applyFilter');
      expect(applyFilterCalls).to.have.lengthOf(1);
      const [, actualCollection] = applyFilterCalls[0].args;
      expect(actualCollection).to.equal(expectedCollection);
    });
    it('applies filter with given query', () => {
      // arrange
      const expectedQuery = 'expected-query';
      const strategy = new FilterStrategyStub();
      const context = new ContextBuilder()
        .withStrategy(strategy)
        .build();
      // act
      context.applyFilter(expectedQuery);
      // assert
      const applyFilterCalls = strategy.callHistory.filter((c) => c.methodName === 'applyFilter');
      expect(applyFilterCalls).to.have.lengthOf(1);
      const [actualQuery] = applyFilterCalls[0].args;
      expect(actualQuery).to.equal(expectedQuery);
    });
  });
});

class ContextBuilder {
  private categoryCollection: ICategoryCollection = new CategoryCollectionStub();

  private filterStrategy: FilterStrategy = new FilterStrategyStub();

  public build(): AdaptiveFilterContext {
    return new AdaptiveFilterContext(
      this.categoryCollection,
      this.filterStrategy,
    );
  }

  public withStrategy(strategy: FilterStrategy): this {
    this.filterStrategy = strategy;
    return this;
  }

  public withCategoryCollection(categoryCollection: ICategoryCollection): this {
    this.categoryCollection = categoryCollection;
    return this;
  }
}
