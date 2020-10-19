import { ScriptStub } from './../stubs/ScriptStub';
import { CategoryStub } from './../stubs/CategoryStub';
import { Application } from '@/domain/Application';
import 'mocha';
import { expect } from 'chai';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { RecommendationLevel, RecommendationLevels } from '@/domain/RecommendationLevel';

describe('Application', () => {
    describe('getScriptsByLevel', () => {
        it('filters out scripts without levels', () => {
            // arrange
            const scriptsWithLevels = RecommendationLevels.map((level, index) =>
                new ScriptStub(`Script${index}`).withLevel(level),
            );
            const toIgnore = new ScriptStub('script-to-ignore').withLevel(undefined);
            for (const currentLevel of RecommendationLevels) {
                const category = new CategoryStub(0)
                    .withScripts(...scriptsWithLevels)
                    .withScript(toIgnore);
                const sut = new Application(createInformation(), [category]);
                // act
                const actual = sut.getScriptsByLevel(currentLevel);
                // assert
                expect(actual).to.not.include(toIgnore);
            }
        });
        it(`${RecommendationLevel[RecommendationLevel.Standard]} filters ${RecommendationLevel[RecommendationLevel.Strict]}`, () => {
            // arrange
            const level = RecommendationLevel.Standard;
            const expected = [
                new ScriptStub('S1').withLevel(level),
                new ScriptStub('S2').withLevel(level),
            ];
            const sut = new Application(createInformation(), [
                new CategoryStub(3).withScripts(...expected,
                    new ScriptStub('S3').withLevel(RecommendationLevel.Strict)),
            ]);
            // act
            const actual = sut.getScriptsByLevel(level);
            // assert
            expect(expected).to.deep.equal(actual);
        });
        it(`${RecommendationLevel[RecommendationLevel.Strict]} includes ${RecommendationLevel[RecommendationLevel.Standard]}`, () => {
            // arrange
            const level = RecommendationLevel.Strict;
            const expected = [
                new ScriptStub('S1').withLevel(RecommendationLevel.Standard),
                new ScriptStub('S2').withLevel(RecommendationLevel.Strict),
            ];
            const sut = new Application(createInformation(), [
                new CategoryStub(3).withScripts(...expected),
            ]);
            // act
            const actual = sut.getScriptsByLevel(level);
            // assert
            expect(expected).to.deep.equal(actual);
        });
        it('throws when level is undefined', () => {
            // arrange
            const sut = new Application(createInformation(), [ getCategoryForValidApplication() ]);
            // act
            const act = () => sut.getScriptsByLevel(undefined);
            // assert
            expect(act).to.throw('undefined level');
        });
        it('throws when level is out of range', () => {
            // arrange
            const invalidValue = 66;
            const sut = new Application(createInformation(), [
                getCategoryForValidApplication(),
            ]);
            // act
            const act = () => sut.getScriptsByLevel(invalidValue);
            // assert
            expect(act).to.throw(`invalid level: ${invalidValue}`);
        });
    });
    describe('ctor', () => {
        it('cannot construct without categories', () => {
            // arrange
            const categories = [];
            // act
            function construct() { return new Application(createInformation(), categories); }
            // assert
            expect(construct).to.throw('Application must consist of at least one category');
        });
        it('cannot construct without scripts', () => {
            // arrange
            const categories = [
                new CategoryStub(3),
                new CategoryStub(2),
            ];
            // act
            function construct() { return new Application(createInformation(), categories); }
            // assert
            expect(construct).to.throw('Application must consist of at least one script');
        });
        describe('cannot construct without any recommended scripts', () => {
            for (const missingLevel of RecommendationLevels) {
                // arrange
                const expectedError = `none of the scripts are recommended as ${RecommendationLevel[missingLevel]}`;
                const otherLevels = RecommendationLevels.filter((level) => level !== missingLevel);
                const categories = otherLevels.map((level, index) =>
                    new CategoryStub(index).withScript(new ScriptStub(`Script${index}`).withLevel(level)),
                );
                // act
                const construct = () => new Application(createInformation(), categories);
                // assert
                expect(construct).to.throw(expectedError);
            }
        });
        it('cannot construct without information', () => {
            // arrange
            const categories = [ new CategoryStub(1).withScripts(
                new ScriptStub('S1').withLevel(RecommendationLevel.Standard))];
            const information = undefined;
            // act
            function construct() { return new Application(information, categories); }
            // assert
            expect(construct).to.throw('info is undefined');
        });
    });
    describe('totalScripts', () => {
        it('returns total of initial scripts', () => {
            // arrange
            const categories = [
                new CategoryStub(1).withScripts(
                    new ScriptStub('S1').withLevel(RecommendationLevel.Standard)),
                new CategoryStub(2).withScripts(
                    new ScriptStub('S2'),
                    new ScriptStub('S3').withLevel(RecommendationLevel.Strict)),
                new CategoryStub(3).withCategories(
                    new CategoryStub(4).withScripts(new ScriptStub('S4'))),
            ];
            // act
            const sut = new Application(createInformation(), categories);
            // assert
            expect(sut.totalScripts).to.equal(4);
        });
    });
    describe('totalCategories', () => {
        it('returns total of initial categories', () => {
            // arrange
            const categories = [
                new CategoryStub(1).withScripts(new ScriptStub('S1').withLevel(RecommendationLevel.Strict)),
                new CategoryStub(2).withScripts(new ScriptStub('S2'), new ScriptStub('S3')),
                new CategoryStub(3).withCategories(new CategoryStub(4).withScripts(new ScriptStub('S4'))),
            ];
            // act
            const sut = new Application(createInformation(), categories);
            // assert
            expect(sut.totalCategories).to.equal(4);
        });
    });
    describe('info', () => {
        it('returns initial information', () => {
            // arrange
            const expected = createInformation();
            // act
            const sut = new Application(
                expected, [ getCategoryForValidApplication() ]);
            // assert
            expect(sut.info).to.deep.equal(expected);
        });
    });
});

function getCategoryForValidApplication() {
    return new CategoryStub(1).withScripts(
        new ScriptStub('S1').withLevel(RecommendationLevel.Standard),
        new ScriptStub('S2').withLevel(RecommendationLevel.Strict));
}

function createInformation(): IProjectInformation {
    return new ProjectInformation('name', 'repo', '0.1.0', 'homepage');
}
