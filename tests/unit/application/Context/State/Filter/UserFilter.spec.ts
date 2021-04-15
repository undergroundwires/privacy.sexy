import 'mocha';
import { expect } from 'chai';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { UserFilter } from '@/application/Context/State/Filter/UserFilter';
import { CategoryStub } from '@tests/unit/stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/stubs/ScriptStub';
import { CategoryCollectionStub } from '@tests/unit/stubs/CategoryCollectionStub';

describe('UserFilter', () => {
    describe('removeFilter', () => {
        it('signals when removing filter', () => {
            // arrange
            let isCalled = false;
            const sut = new UserFilter(new CategoryCollectionStub());
            sut.filterRemoved.on(() => isCalled = true);
            // act
            sut.removeFilter();
            // assert
            expect(isCalled).to.be.equal(true);
        });
        it('sets currentFilter to undefined', () => {
            // arrange
            const sut = new UserFilter(new CategoryCollectionStub());
            // act
            sut.setFilter('non-important');
            sut.removeFilter();
            // assert
            expect(sut.currentFilter).to.be.equal(undefined);
        });
    });
    describe('setFilter', () => {
        it('signals when no matches', () => {
            // arrange
            let actual: IFilterResult;
            const nonMatchingFilter = 'non matching filter';
            const sut = new UserFilter(new CategoryCollectionStub());
            sut.filtered.on((filterResult) => actual = filterResult);
            // act
            sut.setFilter(nonMatchingFilter);
            // assert
            expect(actual.hasAnyMatches()).be.equal(false);
            expect(actual.query).to.equal(nonMatchingFilter);
        });
        it('sets currentFilter as expected when no matches', () => {
            // arrange
            const nonMatchingFilter = 'non matching filter';
            const sut = new UserFilter(new CategoryCollectionStub());
            // act
            sut.setFilter(nonMatchingFilter);
            // assert
            const actual = sut.currentFilter;
            expect(actual.hasAnyMatches()).be.equal(false);
            expect(actual.query).to.equal(nonMatchingFilter);
        });
        describe('signals when matches', () => {
            describe('signals when script matches', () => {
                it('code matches', () => {
                    // arrange
                    const code = 'HELLO world';
                    const filter = 'Hello WoRLD';
                    let actual: IFilterResult;
                    const script = new ScriptStub('id').withCode(code);
                    const category = new CategoryStub(33).withScript(script);
                    const sut = new UserFilter(new CategoryCollectionStub()
                        .withAction(category));
                    sut.filtered.on((filterResult) => actual = filterResult);
                    // act
                    sut.setFilter(filter);
                    // assert
                    expect(actual.hasAnyMatches()).be.equal(true);
                    expect(actual.categoryMatches).to.have.lengthOf(0);
                    expect(actual.scriptMatches).to.have.lengthOf(1);
                    expect(actual.scriptMatches[0]).to.deep.equal(script);
                    expect(actual.query).to.equal(filter);
                    expect(sut.currentFilter).to.deep.equal(actual);
                });
                it('revertCode matches', () => {
                    // arrange
                    const revertCode = 'HELLO world';
                    const filter = 'Hello WoRLD';
                    let actual: IFilterResult;
                    const script = new ScriptStub('id').withRevertCode(revertCode);
                    const category = new CategoryStub(33).withScript(script);
                    const sut = new UserFilter(new CategoryCollectionStub()
                        .withAction(category));
                    sut.filtered.on((filterResult) => actual = filterResult);
                    // act
                    sut.setFilter(filter);
                    // assert
                    expect(actual.hasAnyMatches()).be.equal(true);
                    expect(actual.categoryMatches).to.have.lengthOf(0);
                    expect(actual.scriptMatches).to.have.lengthOf(1);
                    expect(actual.scriptMatches[0]).to.deep.equal(script);
                    expect(actual.query).to.equal(filter);
                    expect(sut.currentFilter).to.deep.equal(actual);
                });
                it('name matches', () => {
                    // arrange
                    const name = 'HELLO world';
                    const filter = 'Hello WoRLD';
                    let actual: IFilterResult;
                    const script = new ScriptStub('id').withName(name);
                    const category = new CategoryStub(33).withScript(script);
                    const sut = new UserFilter(new CategoryCollectionStub()
                        .withAction(category));
                    sut.filtered.on((filterResult) => actual = filterResult);
                    // act
                    sut.setFilter(filter);
                    // assert
                    expect(actual.hasAnyMatches()).be.equal(true);
                    expect(actual.categoryMatches).to.have.lengthOf(0);
                    expect(actual.scriptMatches).to.have.lengthOf(1);
                    expect(actual.scriptMatches[0]).to.deep.equal(script);
                    expect(actual.query).to.equal(filter);
                    expect(sut.currentFilter).to.deep.equal(actual);
                });
            });
            it('signals when category matches', () => {
                // arrange
                const categoryName = 'HELLO world';
                const filter = 'Hello WoRLD';
                let actual: IFilterResult;
                const category = new CategoryStub(55).withName(categoryName);
                const sut = new UserFilter(new CategoryCollectionStub()
                    .withAction(category));
                sut.filtered.on((filterResult) => actual = filterResult);
                // act
                sut.setFilter(filter);
                // assert
                expect(actual.hasAnyMatches()).be.equal(true);
                expect(actual.categoryMatches).to.have.lengthOf(1);
                expect(actual.categoryMatches[0]).to.deep.equal(category);
                expect(actual.scriptMatches).to.have.lengthOf(0);
                expect(actual.query).to.equal(filter);
                expect(sut.currentFilter).to.deep.equal(actual);
            });
            it('signals when category and script matches', () => {
                // arrange
                const matchingText = 'HELLO world';
                const filter = 'Hello WoRLD';
                let actual: IFilterResult;
                const script = new ScriptStub('script')
                    .withName(matchingText);
                const category = new CategoryStub(55)
                    .withName(matchingText)
                    .withScript(script);
                const collection = new CategoryCollectionStub()
                    .withAction(category);
                const sut = new UserFilter(collection);
                sut.filtered.on((filterResult) => actual = filterResult);
                // act
                sut.setFilter(filter);
                // assert
                expect(actual.hasAnyMatches()).be.equal(true);
                expect(actual.categoryMatches).to.have.lengthOf(1);
                expect(actual.categoryMatches[0]).to.deep.equal(category);
                expect(actual.scriptMatches).to.have.lengthOf(1);
                expect(actual.scriptMatches[0]).to.deep.equal(script);
                expect(actual.query).to.equal(filter);
                expect(sut.currentFilter).to.deep.equal(actual);
            });
        });
    });
});
