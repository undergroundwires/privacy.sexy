import { IEntity } from '@/infrastructure/Entity/IEntity';
import applicationFile, { YamlCategory, YamlScript, ApplicationYaml } from 'js-yaml-loader!@/application/application.yaml';
import { parseApplication } from '@/application/Parser/ApplicationParser';
import 'mocha';
import { expect } from 'chai';
import { parseCategory } from '@/application/Parser/CategoryParser';

declare var process;

describe('ApplicationParser', () => {
    describe('parseApplication', () => {
        it('can parse current application file', () => {
            expect(() => parseApplication(applicationFile)).to.not.throw();
        });
        it('throws when undefined', () => {
            expect(() => parseApplication(undefined)).to.throw('application is null or undefined');
        });
        it('throws when undefined actions', () => {
            const sut: ApplicationYaml = {
                name: 'test',
                repositoryUrl: 'https://privacy.sexy',
                actions: undefined,
            };
            expect(() => parseApplication(sut)).to.throw('application does not define any action');
        });
        it('throws when has no actions', () => {
            const sut: ApplicationYaml = {
                name: 'test',
                repositoryUrl: 'https://privacy.sexy',
                actions: [],
            };
            expect(() => parseApplication(sut)).to.throw('application does not define any action');
        });
        it('returns expected name', () => {
            // arrange
            const expected = 'test-app-name';
            const sut: ApplicationYaml = {
                name: expected,
                repositoryUrl: 'https://privacy.sexy',
                actions: [ getTestCategory() ],
            };
            // act
            const actual = parseApplication(sut).name;
            // assert
            expect(actual).to.be.equal(actual);
        });
        it('returns expected repository url', () => {
            // arrange
            const expected = 'https://privacy.sexy';
            const sut: ApplicationYaml = {
                name: 'name',
                repositoryUrl: expected,
                actions: [ getTestCategory() ],
            };
            // act
            const actual = parseApplication(sut).repositoryUrl;
            // assert
            expect(actual).to.be.equal(actual);
        });
        it('returns expected repository version', () => {
            // arrange
            const expected = '1.0.0';
            process = {
                env: {
                    VUE_APP_VERSION: expected,
                },
            };
            const sut: ApplicationYaml = {
                name: 'name',
                repositoryUrl: 'https://privacy.sexy',
                actions: [ getTestCategory() ],
            };
            // act
            const actual = parseApplication(sut).version;
            // assert
            expect(actual).to.be.equal(actual);
        });
        it('parses actions', () => {
            // arrange
            const actions = [ getTestCategory('test1'), getTestCategory('test2') ];
            const expected = [ parseCategory(actions[0]), parseCategory(actions[1]) ];
            const sut: ApplicationYaml = {
                name: 'name',
                repositoryUrl: 'https://privacy.sexy',
                actions,
            };
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

function getTestCategory(scriptName = 'testScript'): YamlCategory {
    return {
        category: 'category name',
        children: [ getTestScript(scriptName) ],
    };
}

function getTestScript(scriptName: string): YamlScript {
    return {
        name: scriptName,
        code: 'script code',
        revertCode: 'revert code',
        recommend: true,
    };
}
