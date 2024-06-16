import { describe, it, expect } from 'vitest';
import type { IEntity } from '@/infrastructure/Entity/IEntity';
import { parseCategoryCollection } from '@/application/Parser/CategoryCollectionParser';
import { parseCategory } from '@/application/Parser/Executable/CategoryParser';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import { ScriptingDefinitionParser } from '@/application/Parser/ScriptingDefinition/ScriptingDefinitionParser';
import { EnumParserStub } from '@tests/unit/shared/Stubs/EnumParserStub';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import { getCategoryStub, CollectionDataStub } from '@tests/unit/shared/Stubs/CollectionDataStub';
import { CategoryCollectionSpecificUtilitiesStub } from '@tests/unit/shared/Stubs/CategoryCollectionSpecificUtilitiesStub';
import { CategoryDataStub } from '@tests/unit/shared/Stubs/CategoryDataStub';
import { createScriptDataWithCall, createScriptDataWithCode } from '@tests/unit/shared/Stubs/ScriptDataStub';
import { createFunctionDataWithCode } from '@tests/unit/shared/Stubs/FunctionDataStub';
import { FunctionCallDataStub } from '@tests/unit/shared/Stubs/FunctionCallDataStub';
import { itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { CategoryData } from '@/application/collections/';

describe('CategoryCollectionParser', () => {
  describe('parseCategoryCollection', () => {
<<<<<<< HEAD
    it('validates object', () => {
      // arrange
      const data = new CollectionDataStub();
      const expectedAssertion: ObjectAssertion<CollectionData> = {
        value: data,
        valueName: 'Collection',
        allowedProperties: [
          'os', 'scripting', 'actions', 'functions',
        ],
      };
      const validator = new TypeValidatorStub();
      const context = new TestContext()
        .withData(data)
        .withTypeValidator(validator);
      // act
      context.parseCategoryCollection();
      // assert
      validator.expectObjectAssertion(expectedAssertion);
    });
=======
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
    describe('actions', () => {
      describe('throws with absent actions', () => {
        itEachAbsentCollectionValue<CategoryData>((absentValue) => {
          // arrange
          const expectedError = 'content does not define any action';
          const collection = new CollectionDataStub()
            .withActions(absentValue);
          const projectDetails = new ProjectDetailsStub();
          // act
          const act = () => parseCategoryCollection(collection, projectDetails);
          // assert
          expect(act).to.throw(expectedError);
        }, { excludeUndefined: true, excludeNull: true });
      });
      it('parses actions', () => {
        // arrange
        const actions = [getCategoryStub('test1'), getCategoryStub('test2')];
<<<<<<< HEAD
        const expectedAssertion: NonEmptyCollectionAssertion = {
          value: actions,
          valueName: '\'actions\' in collection',
        };
        const validator = new TypeValidatorStub();
        const context = new TestContext()
          .withData(new CollectionDataStub().withActions(actions))
          .withTypeValidator(validator);
=======
        const context = new CategoryCollectionSpecificUtilitiesStub();
        const expected = [parseCategory(actions[0], context), parseCategory(actions[1], context)];
        const collection = new CollectionDataStub()
          .withActions(actions);
        const projectDetails = new ProjectDetailsStub();
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
        // act
        const actual = parseCategoryCollection(collection, projectDetails).actions;
        // assert
<<<<<<< HEAD
        validator.expectNonEmptyCollectionAssertion(expectedAssertion);
      });
      it('parses actions correctly', () => {
        // arrange
        const {
          categoryCollectionFactorySpy,
          getInitParameters,
        } = createCategoryCollectionFactorySpy();
        const actionsData = [getCategoryStub('test1'), getCategoryStub('test2')];
        const expectedActions = [
          new CategoryStub('expected-action-1'),
          new CategoryStub('expected-action-2'),
        ];
        const categoryParserStub = new CategoryParserStub()
          .withConfiguredParseResult(actionsData[0], expectedActions[0])
          .withConfiguredParseResult(actionsData[1], expectedActions[1]);
        const collectionData = new CollectionDataStub()
          .withActions(actionsData);
        const context = new TestContext()
          .withData(collectionData)
          .withCategoryParser(categoryParserStub.get())
          .withCategoryCollectionFactory(categoryCollectionFactorySpy);
        // act
        const actualCollection = context.parseCategoryCollection();
        // assert
        const actualActions = getInitParameters(actualCollection)?.actions;
        expect(actualActions).to.have.lengthOf(expectedActions.length);
        expect(actualActions).to.have.members(expectedActions);
      });
      describe('utilities', () => {
        it('parses actions with correct utilities', () => {
          // arrange
          const expectedUtilities = new CategoryCollectionSpecificUtilitiesStub();
          const utilitiesFactory: CategoryCollectionSpecificUtilitiesFactory = () => {
            return expectedUtilities;
          };
          const actionsData = [getCategoryStub('test1'), getCategoryStub('test2')];
          const collectionData = new CollectionDataStub()
            .withActions(actionsData);
          const categoryParserStub = new CategoryParserStub();
          const context = new TestContext()
            .withData(collectionData)
            .withCollectionUtilitiesFactory(utilitiesFactory)
            .withCategoryParser(categoryParserStub.get());
          // act
          context.parseCategoryCollection();
          // assert
          const usedUtilities = categoryParserStub.getUsedUtilities();
          expect(usedUtilities).to.have.lengthOf(2);
          expect(usedUtilities[0]).to.equal(expectedUtilities);
          expect(usedUtilities[1]).to.equal(expectedUtilities);
        });
        describe('construction', () => {
          it('creates utilities with correct functions data', () => {
            // arrange
            const expectedFunctionsData = [createFunctionDataWithCode()];
            const collectionData = new CollectionDataStub()
              .withFunctions(expectedFunctionsData);
            let actualFunctionsData: ReadonlyArray<FunctionData> | undefined;
            const utilitiesFactory: CategoryCollectionSpecificUtilitiesFactory = (data) => {
              actualFunctionsData = data;
              return new CategoryCollectionSpecificUtilitiesStub();
            };
            const context = new TestContext()
              .withData(collectionData)
              .withCollectionUtilitiesFactory(utilitiesFactory);
            // act
            context.parseCategoryCollection();
            // assert
            expect(actualFunctionsData).to.equal(expectedFunctionsData);
=======
        expect(excludingId(actual)).to.be.deep.equal(excludingId(expected));
        function excludingId<TId>(array: ReadonlyArray<IEntity<TId>>) {
          return array.map((obj) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: omitted, ...rest } = obj;
            return rest;
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
          });
        }
      });
    });
    describe('scripting definition', () => {
      it('parses scripting definition as expected', () => {
        // arrange
        const collection = new CollectionDataStub();
        const projectDetails = new ProjectDetailsStub();
        const expected = new ScriptingDefinitionParser()
          .parse(collection.scripting, projectDetails);
        // act
        const actual = parseCategoryCollection(collection, projectDetails).scripting;
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
        const projectDetails = new ProjectDetailsStub();
        // act
        const actual = parseCategoryCollection(collection, projectDetails, parserMock);
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
        const script = createScriptDataWithCall()
          .withCall(new FunctionCallDataStub().withName(functionName).withParameters({}))
          .withName(scriptName);
        const func = createFunctionDataWithCode()
          .withParametersObject([])
          .withName(functionName)
          .withCode(expectedCode);
        const category = new CategoryDataStub()
          .withChildren([script,
            createScriptDataWithCode().withName('2')
              .withRecommendationLevel(RecommendationLevel.Standard),
            createScriptDataWithCode()
              .withName('3').withRecommendationLevel(RecommendationLevel.Strict),
          ]);
        const collection = new CollectionDataStub()
          .withActions([category])
          .withFunctions([func]);
        const projectDetails = new ProjectDetailsStub();
        // act
        const actual = parseCategoryCollection(collection, projectDetails);
        // assert
        const actualScript = actual.getScript(scriptName);
        const actualCode = actualScript.code.execute;
        expect(actualCode).to.equal(expectedCode);
      });
    });
  });
});
