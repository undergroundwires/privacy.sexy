import { CategoryStub } from './../../../stubs/CategoryStub';
import { ScriptStub } from './../../../stubs/ScriptStub';
import { IFilterResult } from '@/application/State/Filter/IFilterResult';
import { ApplicationStub } from './../../../stubs/ApplicationStub';
import { UserFilter } from '@/application/State/Filter/UserFilter';
import 'mocha';
import { expect } from 'chai';

describe('UserFilter', () => {
    it('signals when removing filter', () => {
        // arrange
        let isCalled = false;
        const sut = new UserFilter(new ApplicationStub());
        sut.filterRemoved.on(() => isCalled = true);
        // act
        sut.removeFilter();
        // assert
        expect(isCalled).to.be.equal(true);
    });
    it('signals when no matches', () => {
        // arrange
        let actual: IFilterResult;
        const nonMatchingFilter = 'non matching filter';
        const sut = new UserFilter(new ApplicationStub());
        sut.filtered.on((filterResult) => actual = filterResult);
        // act
        sut.setFilter(nonMatchingFilter);
        // assert
        expect(actual.hasAnyMatches()).be.equal(false);
        expect(actual.categoryMatches).to.have.lengthOf(0);
        expect(actual.scriptMatches).to.have.lengthOf(0);
        expect(actual.query).to.equal(nonMatchingFilter);
    });
    describe('signals when script matches', () => {
        it('code matches', () => {
            // arrange
            const code = 'HELLO world';
            const filter = 'Hello WoRLD';
            let actual: IFilterResult;
            const script = new ScriptStub('id').withCode(code);
            const category = new CategoryStub(33).withScript(script);
            const sut = new UserFilter(new ApplicationStub()
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
        });
        it('revertCode matches', () => {
            // arrange
            const revertCode = 'HELLO world';
            const filter = 'Hello WoRLD';
            let actual: IFilterResult;
            const script = new ScriptStub('id').withRevertCode(revertCode);
            const category = new CategoryStub(33).withScript(script);
            const sut = new UserFilter(new ApplicationStub()
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
        });
        it('name matches', () => {
            // arrange
            const name = 'HELLO world';
            const filter = 'Hello WoRLD';
            let actual: IFilterResult;
            const script = new ScriptStub('id').withName(name);
            const category = new CategoryStub(33).withScript(script);
            const sut = new UserFilter(new ApplicationStub()
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
        });
    });
    it('signals when category matches', () => {
        // arrange
        const categoryName = 'HELLO world';
        const filter = 'Hello WoRLD';
        let actual: IFilterResult;
        const category = new CategoryStub(55).withName(categoryName);
        const sut = new UserFilter(new ApplicationStub()
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
        const app = new ApplicationStub()
            .withAction(category);
        const sut = new UserFilter(app);
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
    });
});
