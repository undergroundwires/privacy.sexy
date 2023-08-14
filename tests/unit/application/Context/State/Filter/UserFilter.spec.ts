import 'mocha';
import { expect } from 'chai';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { UserFilter } from '@/application/Context/State/Filter/UserFilter';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { FilterChange } from '@/application/Context/State/Filter/Event/FilterChange';
import { IFilterChangeDetails } from '@/application/Context/State/Filter/Event/IFilterChangeDetails';
import { ICategoryCollection } from '@/domain/ICategoryCollection';

describe('UserFilter', () => {
  describe('clearFilter', () => {
    it('signals when removing filter', () => {
      // arrange
      const expectedChange = FilterChange.forClear();
      let actualChange: IFilterChangeDetails;
      const sut = new UserFilter(new CategoryCollectionStub());
      sut.filterChanged.on((change) => {
        actualChange = change;
      });
      // act
      sut.clearFilter();
      // assert
      expect(actualChange).to.deep.equal(expectedChange);
    });
    it('sets currentFilter to undefined', () => {
      // arrange
      const sut = new UserFilter(new CategoryCollectionStub());
      // act
      sut.applyFilter('non-important');
      sut.clearFilter();
      // assert
      expect(sut.currentFilter).to.be.equal(undefined);
    });
  });
  describe('applyFilter', () => {
    interface IApplyFilterTestCase {
      readonly name: string;
      readonly filter: string;
      readonly collection: ICategoryCollection;
      readonly assert: (result: IFilterResult) => void;
    }
    const testCases: readonly IApplyFilterTestCase[] = [
      (() => {
        const nonMatchingFilter = 'non matching filter';
        return {
          name: 'given no matches',
          filter: nonMatchingFilter,
          collection: new CategoryCollectionStub(),
          assert: (filter) => {
            expect(filter.hasAnyMatches()).be.equal(false);
            expect(filter.query).to.equal(nonMatchingFilter);
          },
        };
      })(),
      (() => {
        const code = 'HELLO world';
        const matchingFilter = 'Hello WoRLD';
        const script = new ScriptStub('id').withCode(code);
        return {
          name: 'given script match with case-insensitive code',
          filter: matchingFilter,
          collection: new CategoryCollectionStub()
            .withAction(new CategoryStub(33).withScript(script)),
          assert: (filter) => {
            expect(filter.hasAnyMatches()).be.equal(true);
            expect(filter.categoryMatches).to.have.lengthOf(0);
            expect(filter.scriptMatches).to.have.lengthOf(1);
            expect(filter.scriptMatches[0]).to.deep.equal(script);
            expect(filter.query).to.equal(matchingFilter);
          },
        };
      })(),
      (() => {
        const revertCode = 'HELLO world';
        const matchingFilter = 'Hello WoRLD';
        const script = new ScriptStub('id').withRevertCode(revertCode);
        return {
          name: 'given script match with case-insensitive revertCode',
          filter: matchingFilter,
          collection: new CategoryCollectionStub()
            .withAction(new CategoryStub(33).withScript(script)),
          assert: (filter) => {
            expect(filter.hasAnyMatches()).be.equal(true);
            expect(filter.categoryMatches).to.have.lengthOf(0);
            expect(filter.scriptMatches).to.have.lengthOf(1);
            expect(filter.scriptMatches[0]).to.deep.equal(script);
            expect(filter.query).to.equal(matchingFilter);
          },
        };
      })(),
      (() => {
        const name = 'HELLO world';
        const matchingFilter = 'Hello WoRLD';
        const script = new ScriptStub('id').withName(name);
        return {
          name: 'given script match with case-insensitive name',
          filter: matchingFilter,
          collection: new CategoryCollectionStub()
            .withAction(new CategoryStub(33).withScript(script)),
          assert: (filter) => {
            expect(filter.hasAnyMatches()).be.equal(true);
            expect(filter.categoryMatches).to.have.lengthOf(0);
            expect(filter.scriptMatches).to.have.lengthOf(1);
            expect(filter.scriptMatches[0]).to.deep.equal(script);
            expect(filter.query).to.equal(matchingFilter);
          },
        };
      })(),
      (() => {
        const categoryName = 'HELLO world';
        const matchingFilter = 'Hello WoRLD';
        const category = new CategoryStub(55).withName(categoryName);
        return {
          name: 'given category match with case-insensitive name',
          filter: matchingFilter,
          collection: new CategoryCollectionStub()
            .withAction(category),
          assert: (filter) => {
            expect(filter.hasAnyMatches()).be.equal(true);
            expect(filter.categoryMatches).to.have.lengthOf(1);
            expect(filter.categoryMatches[0]).to.deep.equal(category);
            expect(filter.scriptMatches).to.have.lengthOf(0);
            expect(filter.query).to.equal(matchingFilter);
          },
        };
      })(),
      (() => {
        const matchingText = 'HELLO world';
        const matchingFilter = 'Hello WoRLD';
        const script = new ScriptStub('script')
          .withName(matchingText);
        const category = new CategoryStub(55)
          .withName(matchingText)
          .withScript(script);
        return {
          name: 'given category and script matches with case-insensitive names',
          filter: matchingFilter,
          collection: new CategoryCollectionStub()
            .withAction(category),
          assert: (filter) => {
            expect(filter.hasAnyMatches()).be.equal(true);
            expect(filter.categoryMatches).to.have.lengthOf(1);
            expect(filter.categoryMatches[0]).to.deep.equal(category);
            expect(filter.scriptMatches).to.have.lengthOf(1);
            expect(filter.scriptMatches[0]).to.deep.equal(script);
            expect(filter.query).to.equal(matchingFilter);
          },
        };
      })(),
    ];
    describe('sets currentFilter as expected', () => {
      testCases.forEach(({
        name, filter, collection, assert,
      }) => {
        it(name, () => {
          // arrange
          const sut = new UserFilter(collection);
          // act
          sut.applyFilter(filter);
          // assert
          const actual = sut.currentFilter;
          assert(actual);
        });
      });
    });
    describe('signals as expected', () => {
      testCases.forEach(({
        name, filter, collection, assert,
      }) => {
        it(name, () => {
          // arrange
          const sut = new UserFilter(collection);
          let actualFilterResult: IFilterResult;
          sut.filterChanged.on((filterResult) => {
            actualFilterResult = filterResult.filter;
          });
          // act
          sut.applyFilter(filter);
          // assert
          assert(actualFilterResult);
        });
      });
    });
  });
});
