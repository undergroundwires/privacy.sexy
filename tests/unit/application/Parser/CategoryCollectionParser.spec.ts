import { describe, it, expect } from 'vitest';
import { TypeValidatorStub } from '@tests/unit/shared/Stubs/TypeValidatorStub';
import { parseCategoryCollection } from '@/application/Parser/CategoryCollectionParser';
import { type CategoryParser } from '@/application/Parser/Executable/CategoryParser';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { EnumParserStub } from '@tests/unit/shared/Stubs/EnumParserStub';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import { getCategoryStub, CollectionDataStub } from '@tests/unit/shared/Stubs/CollectionDataStub';
import { CategoryCollectionContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionContextStub';
import { createFunctionDataWithCode } from '@tests/unit/shared/Stubs/FunctionDataStub';
import type { CollectionData, ScriptMetadataData, FunctionData } from '@/application/collections/';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { NonEmptyCollectionAssertion, ObjectAssertion, TypeValidator } from '@/application/Parser/Common/TypeValidator';
import type { EnumParser } from '@/application/Common/Enum';
import type { ScriptMetadataParser } from '@/application/Parser/ScriptMetadata/ScriptMetadataParser';
import { ScriptMetadataStub } from '@tests/unit/shared/Stubs/ScriptMetadataStub';
import type { CategoryCollectionContextFactory } from '@/application/Parser/Executable/CategoryCollectionContext';
import { ScriptMetadataDataStub } from '@tests/unit/shared/Stubs/ScriptMetadataDataStub';
import { CategoryParserStub } from '@tests/unit/shared/Stubs/CategoryParserStub';
import { createCategoryCollectionFactorySpy } from '@tests/unit/shared/Stubs/CategoryCollectionFactoryStub';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import type { CategoryCollectionFactory } from '@/domain/Collection/CategoryCollectionFactory';
import { expectArrayEquals } from '@tests/shared/Assertions/ExpectArrayEquals';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('CategoryCollectionParser', () => {
  describe('parseCategoryCollection', () => {
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
    describe('actions', () => {
      it('validates non-empty collection', () => {
        // arrange
        const actions = [getCategoryStub('test1'), getCategoryStub('test2')];
        const expectedAssertion: NonEmptyCollectionAssertion = {
          value: actions,
          valueName: '\'actions\' in collection',
        };
        const validator = new TypeValidatorStub();
        const context = new TestContext()
          .withData(new CollectionDataStub().withActions(actions))
          .withTypeValidator(validator);
        // act
        context.parseCategoryCollection();
        // assert
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
        expectExists(actualActions);
        expectArrayEquals(actualActions, expectedActions, {
          ignoreOrder: true,
        });
      });
      describe('context', () => {
        it('parses actions with correct context', () => {
          // arrange
          const expectedContext = new CategoryCollectionContextStub();
          const contextFactory: CategoryCollectionContextFactory = () => {
            return expectedContext;
          };
          const actionsData = [getCategoryStub('test1'), getCategoryStub('test2')];
          const collectionData = new CollectionDataStub()
            .withActions(actionsData);
          const categoryParserStub = new CategoryParserStub();
          const context = new TestContext()
            .withData(collectionData)
            .withCollectionContextFactory(contextFactory)
            .withCategoryParser(categoryParserStub.get());
          // act
          context.parseCategoryCollection();
          // assert
          const actualContext = categoryParserStub.getUsedContext();
          expect(actualContext).to.have.lengthOf(2);
          expect(actualContext[0]).to.equal(expectedContext);
          expect(actualContext[1]).to.equal(expectedContext);
        });
        describe('construction', () => {
          it('creates with correct functions data', () => {
            // arrange
            const expectedFunctionsData = [createFunctionDataWithCode()];
            const collectionData = new CollectionDataStub()
              .withFunctions(expectedFunctionsData);
            let actualFunctionsData: ReadonlyArray<FunctionData> | undefined;
            const contextFactory: CategoryCollectionContextFactory = (data) => {
              actualFunctionsData = data;
              return new CategoryCollectionContextStub();
            };
            const context = new TestContext()
              .withData(collectionData)
              .withCollectionContextFactory(contextFactory);
            // act
            context.parseCategoryCollection();
            // assert
            expect(actualFunctionsData).to.equal(expectedFunctionsData);
          });
          it('creates with correct language', () => {
            // arrange
            const expectedLanguage = ScriptLanguage.batchfile;
            const scriptMetadataParser: ScriptMetadataParser = () => {
              return new ScriptMetadataStub()
                .withLanguage(expectedLanguage);
            };
            let actualLanguage: ScriptLanguage | undefined;
            const contextFactory: CategoryCollectionContextFactory = (_, language) => {
              actualLanguage = language;
              return new CategoryCollectionContextStub();
            };
            const context = new TestContext()
              .withCollectionContextFactory(contextFactory)
              .withScriptDefinitionParser(scriptMetadataParser);
            // act
            context.parseCategoryCollection();
            // assert
            expect(actualLanguage).to.equal(expectedLanguage);
          });
        });
      });
    });
    describe('script metadata', () => {
      it('parses correctly', () => {
        // arrange
        const {
          categoryCollectionFactorySpy,
          getInitParameters,
        } = createCategoryCollectionFactorySpy();
        const expected = new ScriptMetadataStub();
        const scriptMetadataParser: ScriptMetadataParser = () => {
          return expected;
        };
        const context = new TestContext()
          .withCategoryCollectionFactory(categoryCollectionFactorySpy)
          .withScriptDefinitionParser(scriptMetadataParser);
        // act
        const actualCategoryCollection = context.parseCategoryCollection();
        // assert
        const actual = getInitParameters(actualCategoryCollection)?.scriptMetadata;
        expect(expected).to.equal(actual);
      });
      it('parses expected data', () => {
        // arrange
        const expectedData = new ScriptMetadataDataStub();
        const collection = new CollectionDataStub()
          .withScriptMetadata(expectedData);
        let actualData: ScriptMetadataData | undefined;
        const scriptMetadataParser
        : ScriptMetadataParser = (data: ScriptMetadataData) => {
          actualData = data;
          return new ScriptMetadataStub();
        };
        const context = new TestContext()
          .withScriptDefinitionParser(scriptMetadataParser)
          .withData(collection);
        // act
        context.parseCategoryCollection();
        // assert
        expect(actualData).to.equal(expectedData);
      });
      it('parses with correct project details', () => {
        // arrange
        const expectedProjectDetails = new ProjectDetailsStub();
        let actualDetails: ProjectDetails | undefined;
        const scriptMetadataParser
        : ScriptMetadataParser = (_, details: ProjectDetails) => {
          actualDetails = details;
          return new ScriptMetadataStub();
        };
        const context = new TestContext()
          .withProjectDetails(expectedProjectDetails)
          .withScriptDefinitionParser(scriptMetadataParser);
        // act
        context.parseCategoryCollection();
        // assert
        expect(actualDetails).to.equal(expectedProjectDetails);
      });
    });
    describe('os', () => {
      it('parses correctly', () => {
        // arrange
        const {
          categoryCollectionFactorySpy,
          getInitParameters,
        } = createCategoryCollectionFactorySpy();
        const expectedOs = OperatingSystem.macOS;
        const osText = 'macos';
        const expectedName = 'os';
        const collectionData = new CollectionDataStub()
          .withOs(osText);
        const parserMock = new EnumParserStub<OperatingSystem>()
          .setup(expectedName, osText, expectedOs);
        const context = new TestContext()
          .withOsParser(parserMock)
          .withCategoryCollectionFactory(categoryCollectionFactorySpy)
          .withData(collectionData);
        // act
        const actualCollection = context.parseCategoryCollection();
        // assert
        const actualOs = getInitParameters(actualCollection)?.os;
        expect(actualOs).to.equal(expectedOs);
      });
    });
  });
});

class TestContext {
  private data: CollectionData = new CollectionDataStub();

  private projectDetails: ProjectDetails = new ProjectDetailsStub();

  private validator: TypeValidator = new TypeValidatorStub();

  private osParser: EnumParser<OperatingSystem> = new EnumParserStub<OperatingSystem>()
    .setupDefaultValue(OperatingSystem.Android);

  private collectionContextFactory
  : CategoryCollectionContextFactory = () => {
      return new CategoryCollectionContextStub();
    };

  private scriptDefinitionParser: ScriptMetadataParser = () => new ScriptMetadataStub();

  private categoryParser: CategoryParser = new CategoryParserStub().get();

  private categoryCollectionFactory
  : CategoryCollectionFactory = createCategoryCollectionFactorySpy().categoryCollectionFactorySpy;

  public withData(data: CollectionData): this {
    this.data = data;
    return this;
  }

  public withCategoryParser(categoryParser: CategoryParser): this {
    this.categoryParser = categoryParser;
    return this;
  }

  public withCategoryCollectionFactory(categoryCollectionFactory: CategoryCollectionFactory): this {
    this.categoryCollectionFactory = categoryCollectionFactory;
    return this;
  }

  public withProjectDetails(projectDetails: ProjectDetails): this {
    this.projectDetails = projectDetails;
    return this;
  }

  public withOsParser(osParser: EnumParser<OperatingSystem>): this {
    this.osParser = osParser;
    return this;
  }

  public withScriptDefinitionParser(scriptDefinitionParser: ScriptMetadataParser): this {
    this.scriptDefinitionParser = scriptDefinitionParser;
    return this;
  }

  public withTypeValidator(typeValidator: TypeValidator): this {
    this.validator = typeValidator;
    return this;
  }

  public withCollectionContextFactory(
    collectionContextFactory: CategoryCollectionContextFactory,
  ): this {
    this.collectionContextFactory = collectionContextFactory;
    return this;
  }

  public parseCategoryCollection(): ReturnType<typeof parseCategoryCollection> {
    return parseCategoryCollection(
      this.data,
      this.projectDetails,
      {
        osParser: this.osParser,
        validator: this.validator,
        parseScriptMetadata: this.scriptDefinitionParser,
        createContext: this.collectionContextFactory,
        parseCategory: this.categoryParser,
        createCategoryCollection: this.categoryCollectionFactory,
      },
    );
  }
}
