import { describe, it, expect } from 'vitest';
import type { CategoryData, CategoryOrScriptData } from '@/application/collections/';
import { type CategoryFactory, parseCategory } from '@/application/Parser/CategoryParser';
import { type ScriptParser } from '@/application/Parser/Script/ScriptParser';
import { type DocsParser } from '@/application/Parser/DocumentationParser';
import { CategoryCollectionParseContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionParseContextStub';
import { CategoryDataStub } from '@tests/unit/shared/Stubs/CategoryDataStub';
import { getAbsentCollectionTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { NodeDataType } from '@/application/Parser/NodeValidation/NodeDataType';
import type { ICategoryCollectionParseContext } from '@/application/Parser/Script/ICategoryCollectionParseContext';
import { createScriptDataWithCall, createScriptDataWithCode } from '@tests/unit/shared/Stubs/ScriptDataStub';
import type { ErrorWithContextWrapper } from '@/application/Parser/ContextualError';
import { ErrorWrapperStub } from '@tests/unit/shared/Stubs/ErrorWrapperStub';
import type { NodeDataValidatorFactory } from '@/application/Parser/NodeValidation/NodeDataValidator';
import { NodeDataValidatorStub, createNodeDataValidatorFactoryStub } from '@tests/unit/shared/Stubs/NodeDataValidatorStub';
import type { CategoryNodeErrorContext, UnknownNodeErrorContext } from '@/application/Parser/NodeValidation/NodeDataErrorContext';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { createCategoryFactorySpy } from '@tests/unit/shared/Stubs/CategoryFactoryStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { ScriptParserStub } from '@tests/unit/shared/Stubs/ScriptParserStub';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { indentText } from '@tests/shared/Text';
import { itThrowsContextualError } from './ContextualErrorTester';
import { itValidatesName, itValidatesDefinedData, itAsserts } from './NodeDataValidationTester';
import { generateDataValidationTestScenarios } from './DataValidationTestScenarioGenerator';

describe('CategoryParser', () => {
  describe('parseCategory', () => {
    describe('validation', () => {
      describe('validates for name', () => {
        // arrange
        const expectedName = 'expected category name to be validated';
        const category = new CategoryDataStub()
          .withName(expectedName);
        const expectedContext: CategoryNodeErrorContext = {
          type: NodeDataType.Category,
          selfNode: category,
        };
        itValidatesName((validatorFactory) => {
          // act
          new TestBuilder()
            .withData(category)
            .withValidatorFactory(validatorFactory)
            .parseCategory();
          // assert
          return {
            expectedNameToValidate: expectedName,
            expectedErrorContext: expectedContext,
          };
        });
      });
      describe('validates for defined data', () => {
        // arrange
        const category = new CategoryDataStub();
        const expectedContext: CategoryNodeErrorContext = {
          type: NodeDataType.Category,
          selfNode: category,
        };
        itValidatesDefinedData(
          (validatorFactory) => {
            // act
            new TestBuilder()
              .withData(category)
              .withValidatorFactory(validatorFactory)
              .parseCategory();
            // assert
            return {
              expectedDataToValidate: category,
              expectedErrorContext: expectedContext,
            };
          },
        );
      });
      describe('validates that category has some children', () => {
        const categoryName = 'test';
        const testScenarios = generateDataValidationTestScenarios<CategoryData>({
          expectFail: getAbsentCollectionTestCases<CategoryOrScriptData>().map(({
            valueName, absentValue: absentCollectionValue,
          }) => ({
            description: `with \`${valueName}\` value as children`,
            data: new CategoryDataStub()
              .withName(categoryName)
              .withChildren(absentCollectionValue as unknown as CategoryOrScriptData[]),
          })),
          expectPass: [{
            description: 'has single children',
            data: new CategoryDataStub()
              .withName(categoryName)
              .withChildren([createScriptDataWithCode()]),
          }],
        });
        testScenarios.forEach(({
          description, expectedPass, data: categoryData,
        }) => {
          describe(description, () => {
            itAsserts({
              expectedConditionResult: expectedPass,
              test: (validatorFactory) => {
                const expectedMessage = `"${categoryName}" has no children.`;
                const expectedContext: CategoryNodeErrorContext = {
                  type: NodeDataType.Category,
                  selfNode: categoryData,
                };
                // act
                try {
                  new TestBuilder()
                    .withData(categoryData)
                    .withValidatorFactory(validatorFactory)
                    .parseCategory();
                } catch { /* It may throw due to assertions not being evaluated */ }
                // assert
                return {
                  expectedErrorMessage: expectedMessage,
                  expectedErrorContext: expectedContext,
                };
              },
            });
          });
        });
      });
      describe('validates that a child is a category or a script', () => {
        // arrange
        const testScenarios = generateDataValidationTestScenarios<CategoryOrScriptData>({
          expectFail: [{
            description: 'child has incorrect properties',
            data: { property: 'non-empty-value' } as unknown as CategoryOrScriptData,
          }],
          expectPass: [
            {
              description: 'child is a category',
              data: new CategoryDataStub(),
            },
            {
              description: 'child is a script with call',
              data: createScriptDataWithCall(),
            },
            {
              description: 'child is a script with code',
              data: createScriptDataWithCode(),
            },
          ],
        });
        testScenarios.forEach(({
          description, expectedPass, data: childData,
        }) => {
          describe(description, () => {
            itAsserts({
              expectedConditionResult: expectedPass,
              test: (validatorFactory) => {
                const expectedError = 'Node is neither a category or a script.';
                const parent = new CategoryDataStub()
                  .withName('parent')
                  .withChildren([new CategoryDataStub().withName('valid child'), childData]);
                const expectedContext: UnknownNodeErrorContext = {
                  selfNode: childData,
                  parentNode: parent,
                };
                // act
                new TestBuilder()
                  .withData(parent)
                  .withValidatorFactory(validatorFactory)
                  .parseCategory();
                // assert
                return {
                  expectedErrorMessage: expectedError,
                  expectedErrorContext: expectedContext,
                };
              },
            });
          });
        });
      });
      describe('validates children recursively', () => {
        describe('validates (1th-level) child data', () => {
          // arrange
          const expectedName = 'child category';
          const child = new CategoryDataStub()
            .withName(expectedName);
          const parent = new CategoryDataStub()
            .withName('parent')
            .withChildren([child]);
          const expectedContext: UnknownNodeErrorContext = {
            selfNode: child,
            parentNode: parent,
          };
          itValidatesDefinedData(
            (validatorFactory) => {
              // act
              new TestBuilder()
                .withData(parent)
                .withValidatorFactory(validatorFactory)
                .parseCategory();
              // assert
              return {
                expectedDataToValidate: child,
                expectedErrorContext: expectedContext,
              };
            },
          );
        });
        describe('validates that (2nd-level) child name', () => {
          // arrange
          const expectedName = 'grandchild category';
          const grandChild = new CategoryDataStub()
            .withName(expectedName);
          const child = new CategoryDataStub()
            .withChildren([grandChild])
            .withName('child category');
          const parent = new CategoryDataStub()
            .withName('parent')
            .withChildren([child]);
          const expectedContext: CategoryNodeErrorContext = {
            type: NodeDataType.Category,
            selfNode: grandChild,
            parentNode: child,
          };
          itValidatesName((validatorFactory) => {
            // act
            new TestBuilder()
              .withData(parent)
              .withValidatorFactory(validatorFactory)
              .parseCategory();
            // assert
            return {
              expectedNameToValidate: expectedName,
              expectedErrorContext: expectedContext,
            };
          });
        });
      });
    });
    describe('rethrows exception if category factory fails', () => {
      // arrange
      const givenData = new CategoryDataStub();
      const expectedContextMessage = 'Failed to parse category.';
      const expectedError = new Error();
      // act & assert
      itThrowsContextualError({
        throwingAction: (wrapError) => {
          const validatorStub = new NodeDataValidatorStub();
          validatorStub.createContextualErrorMessage = (message) => message;
          const factoryMock: CategoryFactory = () => {
            throw expectedError;
          };
          new TestBuilder()
            .withCategoryFactory(factoryMock)
            .withValidatorFactory(() => validatorStub)
            .withErrorWrapper(wrapError)
            .withData(givenData)
            .parseCategory();
        },
        expectedWrappedError: expectedError,
        expectedContextMessage,
      });
    });
    it('parses docs correctly', () => {
      // arrange
      const url = 'https://privacy.sexy';
      const categoryData = new CategoryDataStub()
        .withDocs(url);
      const parseDocs: DocsParser = (data) => {
        return [
          `parsed docs: ${JSON.stringify(data)}`,
        ];
      };
      const expectedDocs = parseDocs(categoryData);
      const { categoryFactorySpy, getInitParameters } = createCategoryFactorySpy();
      // act
      const actualCategory = new TestBuilder()
        .withData(categoryData)
        .withCategoryFactory(categoryFactorySpy)
        .withDocsParser(parseDocs)
        .parseCategory();
      // assert
      const actualDocs = getInitParameters(actualCategory)?.docs;
      expect(actualDocs).to.deep.equal(expectedDocs);
    });
    describe('parses expected subscript', () => {
      it('parses single script correctly', () => {
        // arrange
        const expectedScript = new ScriptStub('expected script');
        const scriptParser = new ScriptParserStub();
        const childScriptData = createScriptDataWithCode();
        const categoryData = new CategoryDataStub()
          .withChildren([childScriptData]);
        scriptParser.setupParsedResultForData(childScriptData, expectedScript);
        const { categoryFactorySpy, getInitParameters } = createCategoryFactorySpy();
        // act
        const actualCategory = new TestBuilder()
          .withData(categoryData)
          .withScriptParser(scriptParser.get())
          .withCategoryFactory(categoryFactorySpy)
          .parseCategory();
        // assert
        const actualScripts = getInitParameters(actualCategory)?.scripts;
        expectExists(actualScripts);
        expect(actualScripts).to.have.lengthOf(1);
        const actualScript = actualScripts[0];
        expect(actualScript).to.equal(expectedScript);
      });
      it('parses multiple scripts correctly', () => {
        // arrange
        const expectedScripts = [
          new ScriptStub('expected-first-script'),
          new ScriptStub('expected-second-script'),
        ];
        const childrenData = [
          createScriptDataWithCall(),
          createScriptDataWithCode(),
        ];
        const scriptParser = new ScriptParserStub();
        childrenData.forEach((_, index) => {
          scriptParser.setupParsedResultForData(childrenData[index], expectedScripts[index]);
        });
        const categoryData = new CategoryDataStub()
          .withChildren(childrenData);
        const { categoryFactorySpy, getInitParameters } = createCategoryFactorySpy();
        // act
        const actualCategory = new TestBuilder()
          .withScriptParser(scriptParser.get())
          .withData(categoryData)
          .withCategoryFactory(categoryFactorySpy)
          .parseCategory();
        // assert
        const actualParsedScripts = getInitParameters(actualCategory)?.scripts;
        expectExists(actualParsedScripts);
        expect(actualParsedScripts.length).to.equal(expectedScripts.length);
        expect(actualParsedScripts).to.have.members(expectedScripts);
      });
      it('parses all scripts with correct context', () => {
        // arrange
        const expectedParseContext = new CategoryCollectionParseContextStub();
        const scriptParser = new ScriptParserStub();
        const childrenData = [
          createScriptDataWithCode(),
          createScriptDataWithCode(),
          createScriptDataWithCode(),
        ];
        const categoryData = new CategoryDataStub()
          .withChildren(childrenData);
        const { categoryFactorySpy, getInitParameters } = createCategoryFactorySpy();
        // act
        const actualCategory = new TestBuilder()
          .withData(categoryData)
          .withContext(expectedParseContext)
          .withScriptParser(scriptParser.get())
          .withCategoryFactory(categoryFactorySpy)
          .parseCategory();
        // assert
        const actualParsedScripts = getInitParameters(actualCategory)?.scripts;
        expectExists(actualParsedScripts);
        const actualParseContexts = actualParsedScripts.map(
          (s) => scriptParser.getParseParameters(s)[1],
        );
        expect(
          actualParseContexts.every(
            (actualParseContext) => actualParseContext === expectedParseContext,
          ),
          formatAssertionMessage([
            `Expected all elements to be ${JSON.stringify(expectedParseContext)}`,
            'All elements:',
            indentText(JSON.stringify(actualParseContexts)),
          ]),
        ).to.equal(true);
      });
    });
    it('returns expected subcategories', () => {
      // arrange
      const expectedChildCategory = new CategoryStub(33);
      const childCategoryData = new CategoryDataStub()
        .withName('expected child category')
        .withChildren([createScriptDataWithCode()]);
      const categoryData = new CategoryDataStub()
        .withName('category name')
        .withChildren([childCategoryData]);
      const { categoryFactorySpy, getInitParameters } = createCategoryFactorySpy();
      // act
      const actualCategory = new TestBuilder()
        .withData(categoryData)
        .withCategoryFactory((parameters) => {
          if (parameters.name === childCategoryData.category) {
            return expectedChildCategory;
          }
          return categoryFactorySpy(parameters);
        })
        .parseCategory();
      // assert
      const actualSubcategories = getInitParameters(actualCategory)?.subcategories;
      expectExists(actualSubcategories);
      expect(actualSubcategories).to.have.lengthOf(1);
      expect(actualSubcategories[0]).to.equal(expectedChildCategory);
    });
  });
});

class TestBuilder {
  private data: CategoryData = new CategoryDataStub();

  private context: ICategoryCollectionParseContext = new CategoryCollectionParseContextStub();

  private categoryFactory: CategoryFactory = () => new CategoryStub(33);

  private errorWrapper: ErrorWithContextWrapper = new ErrorWrapperStub().get();

  private validatorFactory: NodeDataValidatorFactory = createNodeDataValidatorFactoryStub;

  private docsParser: DocsParser = () => ['docs'];

  private scriptParser: ScriptParser = new ScriptParserStub().get();

  public withData(data: CategoryData) {
    this.data = data;
    return this;
  }

  public withContext(context: ICategoryCollectionParseContext): this {
    this.context = context;
    return this;
  }

  public withCategoryFactory(categoryFactory: CategoryFactory): this {
    this.categoryFactory = categoryFactory;
    return this;
  }

  public withValidatorFactory(validatorFactory: NodeDataValidatorFactory): this {
    this.validatorFactory = validatorFactory;
    return this;
  }

  public withErrorWrapper(errorWrapper: ErrorWithContextWrapper): this {
    this.errorWrapper = errorWrapper;
    return this;
  }

  public withScriptParser(scriptParser: ScriptParser): this {
    this.scriptParser = scriptParser;
    return this;
  }

  public withDocsParser(docsParser: DocsParser): this {
    this.docsParser = docsParser;
    return this;
  }

  public parseCategory() {
    return parseCategory(
      this.data,
      this.context,
      {
        createCategory: this.categoryFactory,
        wrapError: this.errorWrapper,
        createValidator: this.validatorFactory,
        parseScript: this.scriptParser,
        parseDocs: this.docsParser,
      },
    );
  }
}
