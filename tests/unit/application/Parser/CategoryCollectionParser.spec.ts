import 'mocha';
import { expect } from 'chai';
import { IEntity } from '@/infrastructure/Entity/IEntity';
import { parseCategoryCollection } from '@/application/Parser/CategoryCollectionParser';
import { parseCategory } from '@/application/Parser/CategoryParser';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptingDefinitionParser } from '@/application/Parser/ScriptingDefinition/ScriptingDefinitionParser';
import { EnumParserStub } from '@tests/unit/stubs/EnumParserStub';
import { ProjectInformationStub } from '@tests/unit/stubs/ProjectInformationStub';
import { getCategoryStub, CollectionDataStub } from '@tests/unit/stubs/CollectionDataStub';
import { CategoryCollectionParseContextStub } from '@tests/unit/stubs/CategoryCollectionParseContextStub';
import { CategoryDataStub } from '@tests/unit/stubs/CategoryDataStub';
import { ScriptDataStub } from '@tests/unit/stubs/ScriptDataStub';
import { FunctionDataStub } from '@tests/unit/stubs/FunctionDataStub';

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
                const collection = new CollectionDataStub()
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
                const collection = new CollectionDataStub()
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
                const context = new CategoryCollectionParseContextStub();
                const expected = [ parseCategory(actions[0], context), parseCategory(actions[1], context) ];
                const collection = new CollectionDataStub()
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
                const collection = new CollectionDataStub();
                const information = parseProjectInformation(process.env);
                const expected = new ScriptingDefinitionParser()
                    .parse(collection.scripting, information);
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
                const collection = new CollectionDataStub()
                    .withOs(osText);
                const parserMock = new EnumParserStub<OperatingSystem>()
                    .setup(expectedName, osText, expectedOs);
                const info = new ProjectInformationStub();
                // act
                const actual = parseCategoryCollection(collection, info, parserMock);
                // assert
                expect(actual.os).to.equal(expectedOs);
            });
        });
        describe('functions', () => {
            it('compiles script call with given function', () => {
                // arrange
                const expectedCode = 'code-from-the-function';
                const functionName = 'function-name';
                const scriptName = 'script-name';
                const script = ScriptDataStub.createWithCall({ function: functionName })
                    .withName(scriptName);
                const func = FunctionDataStub.createWithCode()
                    .withName(functionName)
                    .withCode(expectedCode);
                const category = new CategoryDataStub()
                    .withChildren([ script,
                        ScriptDataStub.createWithCode().withName('2')
                            .withRecommendationLevel(RecommendationLevel.Standard),
                        ScriptDataStub.createWithCode()
                            .withName('3').withRecommendationLevel(RecommendationLevel.Strict),
                     ]);
                const collection = new CollectionDataStub()
                    .withActions([ category ])
                    .withFunctions([ func ]);
                const info = new ProjectInformationStub();
                // act
                const actual = parseCategoryCollection(collection, info);
                // assert
                const actualScript = actual.findScript(scriptName);
                const actualCode = actualScript.code.execute;
                expect(actualCode).to.equal(expectedCode);
            });
        });
    });
});
