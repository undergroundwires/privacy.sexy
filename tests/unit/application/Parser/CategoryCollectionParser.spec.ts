import 'mocha';
import { expect } from 'chai';
import { IEntity } from '@/infrastructure/Entity/IEntity';
import { parseCategoryCollection } from '@/application/Parser/CategoryCollectionParser';
import { parseCategory } from '@/application/Parser/CategoryParser';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { parseScriptingDefinition } from '@/application/Parser/ScriptingDefinitionParser';
import { mockEnumParser } from '../../stubs/EnumParserStub';
import { ProjectInformationStub } from '../../stubs/ProjectInformationStub';
import { ScriptCompilerStub } from '../../stubs/ScriptCompilerStub';
import { getCategoryStub, YamlApplicationStub } from '../../stubs/YamlApplicationStub';

describe('CategoryCollectionParser', () => {
    describe('parseCategoryCollection', () => {
        it('throws when undefined', () => {
            // arrange
            const expectedError = 'content is null or undefined';
            const info = new ProjectInformationStub();
            // act
            const act = () => parseCategoryCollection(undefined, info);
            // assert
            expect(act).to.throw(expectedError);
        });
        describe('actions', () => {
            it('throws when undefined actions', () => {
                // arrange
                const expectedError = 'content does not define any action';
                const collection = new YamlApplicationStub()
                    .withActions(undefined);
                const info = new ProjectInformationStub();
                // act
                const act = () => parseCategoryCollection(collection, info);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('throws when has no actions', () => {
                // arrange
                const expectedError = 'content does not define any action';
                const collection = new YamlApplicationStub()
                    .withActions([]);
                const info = new ProjectInformationStub();
                // act
                const act = () => parseCategoryCollection(collection, info);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('parses actions', () => {
                // arrange
                const actions = [ getCategoryStub('test1'), getCategoryStub('test2') ];
                const compiler = new ScriptCompilerStub();
                const expected = [ parseCategory(actions[0], compiler), parseCategory(actions[1], compiler) ];
                const collection = new YamlApplicationStub()
                    .withActions(actions);
                const info = new ProjectInformationStub();
                // act
                const actual = parseCategoryCollection(collection, info).actions;
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
        describe('scripting definition', () => {
            it('parses scripting definition as expected', () => {
                // arrange
                const collection = new YamlApplicationStub();
                const information = parseProjectInformation(process.env);
                const expected = parseScriptingDefinition(collection.scripting, information);
                // act
                const actual = parseCategoryCollection(collection, information).scripting;
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
                const collection = new YamlApplicationStub()
                    .withOs(osText);
                const parserMock = mockEnumParser(expectedName, osText, expectedOs);
                const info = new ProjectInformationStub();
                // act
                const actual = parseCategoryCollection(collection, info, parserMock);
                // assert
                expect(actual.os).to.equal(expectedOs);
            });
        });
    });
});
