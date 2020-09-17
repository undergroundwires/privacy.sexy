import { IEntity } from '@/infrastructure/Entity/IEntity';
import applicationFile, { YamlCategory, YamlScript, ApplicationYaml } from 'js-yaml-loader!@/application/application.yaml';
import { parseApplication } from '@/application/Parser/ApplicationParser';
import 'mocha';
import { expect } from 'chai';
import { parseCategory } from '@/application/Parser/CategoryParser';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptCompilerStub } from '../../stubs/ScriptCompilerStub';

describe('ApplicationParser', () => {
    describe('parseApplication', () => {
        it('can parse current application file', () => {
            // act
            const act = () => parseApplication(applicationFile);
            // assert
            expect(act).to.not.throw();
        });
        it('throws when undefined', () => {
            // arrange
            const expectedError = 'application is null or undefined';
            // act
            const act = () => parseApplication(undefined);
            // assert
            expect(act).to.throw(expectedError);
        });
        it('throws when undefined actions', () => {
            // arrange
            const sut: ApplicationYaml = { actions: undefined, functions: undefined };
            const expectedError = 'application does not define any action';
            // act
            const act = () => parseApplication(sut);
            // assert
            expect(act).to.throw(expectedError);
        });
        it('throws when has no actions', () => {
            // arrange
            const sut: ApplicationYaml = { actions: [], functions: undefined };
            const expectedError = 'application does not define any action';
            // act
            const act = () => parseApplication(sut);
            // assert
            expect(act).to.throw(expectedError);
        });
        describe('information', () => {
            it('returns expected repository version', () => {
                // arrange
                const expected = 'expected-version';
                const env = getProcessEnvironmentStub();
                env.VUE_APP_VERSION = expected;
                const sut: ApplicationYaml = { actions: [ getTestCategory() ], functions: undefined };
                // act
                const actual = parseApplication(sut, env).info.version;
                // assert
                expect(actual).to.be.equal(expected);
            });
            it('returns expected repository url', () => {
                // arrange
                const expected = 'https://expected-repository.url';
                const env = getProcessEnvironmentStub();
                env.VUE_APP_REPOSITORY_URL = expected;
                const sut: ApplicationYaml = { actions: [ getTestCategory() ], functions: undefined };
                // act
                const actual = parseApplication(sut, env).info.repositoryUrl;
                // assert
                expect(actual).to.be.equal(expected);
            });
            it('returns expected name', () => {
                // arrange
                const expected = 'expected-app-name';
                const env = getProcessEnvironmentStub();
                env.VUE_APP_NAME = expected;
                const sut: ApplicationYaml = { actions: [ getTestCategory() ], functions: undefined };
                // act
                const actual = parseApplication(sut, env).info.name;
                // assert
                expect(actual).to.be.equal(expected);
            });
            it('returns expected homepage url', () => {
                // arrange
                const expected = 'https://expected.sexy';
                const env = getProcessEnvironmentStub();
                env.VUE_APP_HOMEPAGE_URL = expected;
                const sut: ApplicationYaml = { actions: [ getTestCategory() ], functions: undefined };
                // act
                const actual = parseApplication(sut, env).info.homepage;
                // assert
                expect(actual).to.be.equal(expected);
            });
        });
        it('parses actions', () => {
            // arrange
            const actions = [ getTestCategory('test1'), getTestCategory('test2') ];
            const compiler = new ScriptCompilerStub();
            const expected = [ parseCategory(actions[0], compiler), parseCategory(actions[1], compiler) ];
            const sut: ApplicationYaml = { actions, functions: undefined };
            // act
            const actual = parseApplication(sut).actions;
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
});

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
