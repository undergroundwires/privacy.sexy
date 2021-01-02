import { IEntity } from '@/infrastructure/Entity/IEntity';
import applicationFile, { YamlCategory, YamlScript, YamlApplication, YamlScriptingDefinition } from 'js-yaml-loader!@/application/application.yaml';
import { parseCategoryCollection } from '@/application/Parser/CategoryCollectionParser';
import 'mocha';
import { expect } from 'chai';
import { parseCategory } from '@/application/Parser/CategoryParser';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptCompilerStub } from '../../stubs/ScriptCompilerStub';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { parseScriptingDefinition } from '@/application/Parser/ScriptingDefinitionParser';
import { mockEnumParser } from '../../stubs/EnumParserStub';

describe('CategoryCollectionParser', () => {
    describe('parseCategoryCollection', () => {
        it('can parse current application file', () => {
            // act
            const act = () => parseCategoryCollection(applicationFile);
            // assert
            expect(act).to.not.throw();
        });
        it('throws when undefined', () => {
            // arrange
            const expectedError = 'content is null or undefined';
            // act
            const act = () => parseCategoryCollection(undefined);
            // assert
            expect(act).to.throw(expectedError);
        });
        describe('actions', () => {
            it('throws when undefined actions', () => {
                // arrange
                const expectedError = 'content does not define any action';
                const collection = new YamlApplicationBuilder().withActions(undefined).build();
                // act
                const act = () => parseCategoryCollection(collection);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('throws when has no actions', () => {
                // arrange
                const expectedError = 'content does not define any action';
                const collection = new YamlApplicationBuilder().withActions([]).build();
                // act
                const act = () => parseCategoryCollection(collection);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('parses actions', () => {
                // arrange
                const actions = [ getTestCategory('test1'), getTestCategory('test2') ];
                const compiler = new ScriptCompilerStub();
                const expected = [ parseCategory(actions[0], compiler), parseCategory(actions[1], compiler) ];
                const collection = new YamlApplicationBuilder().withActions(actions).build();
                // act
                const actual = parseCategoryCollection(collection).actions;
                // assert
                expect(excludingId(actual)).to.be.deep.equal(excludingId(expected));
                function excludingId<TId>(array: ReadonlyArray<IEntity<TId>>) {
                    return array.map((obj) => {
                        const { ['id']: omitted, ...rest } = obj;
                        return rest;
                    });
                }
            });
        });
        describe('info', () => {
            it('returns expected repository version', () => {
                // arrange
                const expected = 'expected-version';
                const env = getProcessEnvironmentStub();
                env.VUE_APP_VERSION = expected;
                const collection = new YamlApplicationBuilder().build();
                // act
                const actual = parseCategoryCollection(collection, env).info.version;
                // assert
                expect(actual).to.be.equal(expected);
            });
            it('returns expected repository url', () => {
                // arrange
                const expected = 'https://expected-repository.url';
                const env = getProcessEnvironmentStub();
                env.VUE_APP_REPOSITORY_URL = expected;
                const collection = new YamlApplicationBuilder().build();
                // act
                const actual = parseCategoryCollection(collection, env).info.repositoryUrl;
                // assert
                expect(actual).to.be.equal(expected);
            });
            it('returns expected name', () => {
                // arrange
                const expected = 'expected-app-name';
                const env = getProcessEnvironmentStub();
                env.VUE_APP_NAME = expected;
                const collection = new YamlApplicationBuilder().build();
                // act
                const actual = parseCategoryCollection(collection, env).info.name;
                // assert
                expect(actual).to.be.equal(expected);
            });
            it('returns expected homepage url', () => {
                // arrange
                const expected = 'https://expected.sexy';
                const env = getProcessEnvironmentStub();
                env.VUE_APP_HOMEPAGE_URL = expected;
                const collection = new YamlApplicationBuilder().build();
                // act
                const actual = parseCategoryCollection(collection, env).info.homepage;
                // assert
                expect(actual).to.be.equal(expected);
            });
        });
        describe('scripting definition', () => {
            it('parses scripting definition as expected', () => {
                // arrange
                const collection = new YamlApplicationBuilder().build();
                const information = parseProjectInformation(process.env);
                const expected = parseScriptingDefinition(collection.scripting, information);
                // act
                const actual = parseCategoryCollection(collection).scripting;
                // assert
                expect(expected).to.deep.equal(actual);
            });
        });
        describe('os', () => {
            it('parses as expected', () => {
                // arrange
                const expectedOs = OperatingSystem.macOS;
                const osText = 'macos';
                const expectedName = 'os';
                const collection = new YamlApplicationBuilder()
                    .withOs(osText)
                    .build();
                const parserMock = mockEnumParser(expectedName, osText, expectedOs);
                const env = getProcessEnvironmentStub();
                // act
                const actual = parseCategoryCollection(collection, env, parserMock);
                // assert
                expect(actual.os).to.equal(expectedOs);
            });
        });
    });
});

class YamlApplicationBuilder {
    private os = 'windows';
    private actions: readonly YamlCategory[] = [ getTestCategory() ];
    private scripting: YamlScriptingDefinition = getTestDefinition();

    public withActions(actions: readonly YamlCategory[]): YamlApplicationBuilder {
        this.actions = actions;
        return this;
    }

    public withOs(os: string): YamlApplicationBuilder {
        this.os = os;
        return this;
    }

    public withScripting(scripting: YamlScriptingDefinition): YamlApplicationBuilder {
        this.scripting = scripting;
        return this;
    }

    public build(): YamlApplication {
        return { os: this.os, scripting: this.scripting, actions: this.actions };
    }
}

function getTestDefinition(): YamlScriptingDefinition {
    return {
        fileExtension: '.bat',
        language: ScriptingLanguage[ScriptingLanguage.batchfile],
        startCode: 'start',
        endCode: 'end',
    };
}

function getTestCategory(scriptPrefix = 'testScript'): YamlCategory {
    return {
        category: 'category name',
        children: [
            getTestScript(`${scriptPrefix}-standard`, RecommendationLevel.Standard),
            getTestScript(`${scriptPrefix}-strict`, RecommendationLevel.Strict),
        ],
    };
}

function getTestScript(scriptName: string, level: RecommendationLevel = RecommendationLevel.Standard): YamlScript {
    return {
        name: scriptName,
        code: 'script code',
        revertCode: 'revert code',
        recommend: RecommendationLevel[level].toLowerCase(),
        call: undefined,
    };
}

function getProcessEnvironmentStub(): NodeJS.ProcessEnv {
    return {
        VUE_APP_VERSION: 'stub-version',
        VUE_APP_NAME: 'stub-name',
        VUE_APP_REPOSITORY_URL: 'stub-repository-url',
        VUE_APP_HOMEPAGE_URL: 'stub-homepage-url',
    };
}
