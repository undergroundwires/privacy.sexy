import { ScriptStub } from './../stubs/ScriptStub';
import { CategoryStub } from './../stubs/CategoryStub';
import { Application } from '@/domain/Application';
import 'mocha';
import { expect } from 'chai';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ICategory } from '@/domain/IApplication';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { getEnumValues } from '@/application/Common/Enum';

describe('Application', () => {
    describe('getScriptsByLevel', () => {
        it('filters out scripts without levels', () => {
            // arrange
            const recommendationLevels = getEnumValues(RecommendationLevel);
            const scriptsWithLevels = recommendationLevels.map((level, index) =>
                new ScriptStub(`Script${index}`).withLevel(level),
            );
            const toIgnore = new ScriptStub('script-to-ignore').withLevel(undefined);
            for (const currentLevel of recommendationLevels) {
                const category = new CategoryStub(0)
                    .withScripts(...scriptsWithLevels)
                    .withScript(toIgnore);
                const sut = new ApplicationBuilder().withActions([category]).construct();
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
            const actions = [
                new CategoryStub(3).withScripts(...expected,
                    new ScriptStub('S3').withLevel(RecommendationLevel.Strict)),
            ];
            const sut = new ApplicationBuilder().withActions(actions).construct();
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
            const actions = [
                new CategoryStub(3).withScripts(...expected),
            ];
            const sut = new ApplicationBuilder().withActions(actions).construct();
            // act
            const actual = sut.getScriptsByLevel(level);
            // assert
            expect(expected).to.deep.equal(actual);
        });
        it('throws when level is undefined', () => {
            // arrange
            const sut = new ApplicationBuilder().construct();
            // act
            const act = () => sut.getScriptsByLevel(undefined);
            // assert
            expect(act).to.throw('undefined level');
        });
        it('throws when level is out of range', () => {
            // arrange
            const invalidValue = 66;
            const sut = new ApplicationBuilder().construct();
            // act
            const act = () => sut.getScriptsByLevel(invalidValue);
            // assert
            expect(act).to.throw(`invalid level: ${invalidValue}`);
        });
    });
    describe('actions', () => {
        it('cannot construct without actions', () => {
            // arrange
            const categories = [];
            // act
            function construct() {
                new ApplicationBuilder().withActions(categories).construct();
             }
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
            function construct() {
                new ApplicationBuilder().withActions(categories).construct();
            }
            // assert
            expect(construct).to.throw('Application must consist of at least one script');
        });
        describe('cannot construct without any recommended scripts', () => {
            // arrange
            const recommendationLevels = getEnumValues(RecommendationLevel);
            for (const missingLevel of recommendationLevels) {
                it(`when "${RecommendationLevel[missingLevel]}" is missing`, () => {
                    const expectedError = `none of the scripts are recommended as ${RecommendationLevel[missingLevel]}`;
                    const otherLevels = recommendationLevels.filter((level) => level !== missingLevel);
                    const categories = otherLevels.map((level, index) =>
                        new CategoryStub(index).withScript(
                            new ScriptStub(`Script${index}`).withLevel(level),
                        ));
                    // act
                    const construct = () => new ApplicationBuilder()
                        .withActions(categories)
                        .construct();
                    // assert
                    expect(construct).to.throw(expectedError);
                });
            }
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
            const sut = new ApplicationBuilder().withActions(categories).construct();
            // assert
            expect(sut.totalScripts).to.equal(4);
        });
    });
    describe('totalCategories', () => {
        it('returns total of initial categories', () => {
            // arrange
            const expected = 4;
            const categories = [
                new CategoryStub(1).withScripts(new ScriptStub('S1').withLevel(RecommendationLevel.Strict)),
                new CategoryStub(2).withScripts(new ScriptStub('S2'), new ScriptStub('S3')),
                new CategoryStub(3).withCategories(new CategoryStub(4).withScripts(new ScriptStub('S4'))),
            ];
            // act
            const sut = new ApplicationBuilder()
                .withActions(categories)
                .construct();
            // assert
            expect(sut.totalCategories).to.equal(expected);
        });
    });
    describe('information', () => {
        it('sets information as expected', () => {
            // arrange
            const expected = new ProjectInformation(
                'expected-name', 'expected-repo', '0.31.0', 'expected-homepage');
            // act
            const sut = new ApplicationBuilder().withInfo(expected).construct();
            // assert
            expect(sut.info).to.deep.equal(expected);
        });
        it('cannot construct without information', () => {
            // arrange
            const information = undefined;
            // act
            function construct() {
                return new ApplicationBuilder().withInfo(information).construct();
            }
            // assert
            expect(construct).to.throw('undefined info');
        });
    });
    describe('os', () => {
        it('sets os as expected', () => {
            // arrange
            const expected = OperatingSystem.macOS;
            // act
            const sut = new ApplicationBuilder().withOs(expected).construct();
            // assert
            expect(sut.os).to.deep.equal(expected);
        });
        it('cannot construct with unknown os', () => {
            // arrange
            const os = OperatingSystem.Unknown;
            // act
            const construct = () => new ApplicationBuilder().withOs(os).construct();
            // assert
            expect(construct).to.throw('unknown os');
        });
        it('cannot construct with undefined os', () => {
            // arrange
            const os = undefined;
            // act
            const construct = () => new ApplicationBuilder().withOs(os).construct();
            // assert
            expect(construct).to.throw('undefined os');
        });
        it('cannot construct with OS not in range', () => {
            // arrange
            const os: OperatingSystem = 666;
            // act
            const construct = () => new ApplicationBuilder().withOs(os).construct();
            // assert
            expect(construct).to.throw(`os "${os}" is out of range`);
        });
    });
    describe('scriptingDefinition', () => {
        it('sets scriptingDefinition as expected', () => {
            // arrange
            const expected = getValidScriptingDefinition();
            // act
            const sut = new ApplicationBuilder().withScripting(expected).construct();
            // assert
            expect(sut.scripting).to.deep.equal(expected);
        });
        it('cannot construct without initial script', () => {
            // arrange
            const scriptingDefinition = undefined;
            // act
            function construct() {
                return new ApplicationBuilder().withScripting(scriptingDefinition).construct();
            }
            // assert
            expect(construct).to.throw('undefined scripting definition');
        });
    });
});

function getValidScriptingDefinition(): IScriptingDefinition {
    return {
        fileExtension: '.bat',
        language: ScriptingLanguage.batchfile,
        startCode: 'start',
        endCode: 'end',
    };
}

class ApplicationBuilder {
    private os = OperatingSystem.Windows;
    private info = new ProjectInformation('name', 'repo', '0.1.0', 'homepage');
    private actions: readonly ICategory[] = [
        new CategoryStub(1).withScripts(
            new ScriptStub('S1').withLevel(RecommendationLevel.Standard),
            new ScriptStub('S2').withLevel(RecommendationLevel.Strict)),
    ];
    private script: IScriptingDefinition = getValidScriptingDefinition();
    public withOs(os: OperatingSystem): ApplicationBuilder {
        this.os = os;
        return this;
    }
    public withInfo(info: IProjectInformation) {
        this.info = info;
        return this;
    }
    public withActions(actions: readonly ICategory[]) {
        this.actions = actions;
        return this;
    }
    public withScripting(script: IScriptingDefinition) {
        this.script = script;
        return this;
    }
    public construct(): Application {
        return new Application(this.os, this.info, this.actions, this.script);
    }
}
