import { describe, it, expect } from 'vitest';
import type { CategoryData, ExecutableData } from '@/application/collections/';
import { parseCategory } from '@/application/Parser/Executable/CategoryParser';
import { type ScriptParser } from '@/application/Parser/Executable/Script/ScriptParser';
import { type DocsParser } from '@/application/Parser/Executable/DocumentationParser';
import { CategoryCollectionContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionContextStub';
import { CategoryDataStub } from '@tests/unit/shared/Stubs/CategoryDataStub';
import { ExecutableType } from '@/application/Parser/Executable/Validation/ExecutableType';
import { createScriptDataWithCall, createScriptDataWithCode } from '@tests/unit/shared/Stubs/ScriptDataStub';
import type { ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import { ErrorWrapperStub } from '@tests/unit/shared/Stubs/ErrorWrapperStub';
import type { ExecutableValidatorFactory } from '@/application/Parser/Executable/Validation/ExecutableValidator';
import { ExecutableValidatorStub, createExecutableValidatorFactoryStub } from '@tests/unit/shared/Stubs/ExecutableValidatorStub';
import type { CategoryErrorContext, UnknownExecutableErrorContext } from '@/application/Parser/Executable/Validation/ExecutableErrorContext';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { createCategoryFactorySpy } from '@tests/unit/shared/Stubs/CategoryFactoryStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { ScriptParserStub } from '@tests/unit/shared/Stubs/ScriptParserStub';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import type { NonEmptyCollectionAssertion, ObjectAssertion } from '@/application/Parser/Common/TypeValidator';
import { indentText } from '@/application/Common/Text/IndentText';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
import type { CategoryFactory } from '@/domain/Executables/Category/CategoryFactory';
import { expectArrayEquals } from '@tests/shared/Assertions/ExpectArrayEquals';
import { itThrowsContextualError } from '../Common/ContextualErrorTester';
import { itValidatesName, itValidatesType, itAsserts } from './Validation/ExecutableValidationTester';
import { generateDataValidationTestScenarios } from './Validation/DataValidationTestScenarioGenerator';

describe('CategoryParser', () => {
  describe('parseCategory', () => {
    describe('id', () => {
      it('creates ID correctly', () => {
        // arrange
        const expectedId: ExecutableId = 'expected-id';
        const categoryData = new CategoryDataStub()
          .withName(expectedId);
        const { categoryFactorySpy, getInitParameters } = createCategoryFactorySpy();
        // act
        const actualScript = new TestContext()
          .withData(categoryData)
          .withCategoryFactory(categoryFactorySpy)
          .parseCategory();
        // assert
        const actualId = getInitParameters(actualScript)?.executableId;
        expect(actualId).to.equal(expectedId);
      });
    });
    describe('name', () => {
      it('parses name correctly', () => {
        // arrange
        const expectedName = 'test-expected-name';
        const categoryData = new CategoryDataStub()
          .withName(expectedName);
        const { categoryFactorySpy, getInitParameters } = createCategoryFactorySpy();
        // act
        const actualCategory = new TestContext()
          .withData(categoryData)
          .withCategoryFactory(categoryFactorySpy)
          .parseCategory();
        // assert
        const actualName = getInitParameters(actualCategory)?.name;
        expect(actualName).to.equal(expectedName);
      });
      describe('validates name', () => {
        // arrange
        const expectedName = 'expected category name to be validated';
        const category = new CategoryDataStub()
          .withName(expectedName);
        const expectedContext: CategoryErrorContext = {
          type: ExecutableType.Category,
          self: category,
        };
        itValidatesName((validatorFactory) => {
          // act
          new TestContext()
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
    });
    describe('docs', () => {
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
        const actualCategory = new TestContext()
          .withData(categoryData)
          .withCategoryFactory(categoryFactorySpy)
          .withDocsParser(parseDocs)
          .parseCategory();
        // assert
        const actualDocs = getInitParameters(actualCategory)?.docs;
        expect(actualDocs).to.deep.equal(expectedDocs);
      });
    });
    describe('property validation', () => {
      describe('validates for unknown executable', () => {
        // arrange
        const category = new CategoryDataStub();
        const expectedContext: CategoryErrorContext = {
          type: ExecutableType.Category,
          self: category,
        };
        const expectedAssertion: ObjectAssertion<unknown> = {
          value: category,
          valueName: 'Executable',
        };
        itValidatesType(
          (validatorFactory) => {
            // act
            new TestContext()
              .withData(category)
              .withValidatorFactory(validatorFactory)
              .parseCategory();
            // assert
            return {
              assertValidation: (validator) => validator.assertObject(expectedAssertion),
              expectedErrorContext: expectedContext,
            };
          },
        );
      });
      describe('validates for category', () => {
        // arrange
        const category = new CategoryDataStub();
        const expectedContext: CategoryErrorContext = {
          type: ExecutableType.Category,
          self: category,
        };
        const expectedAssertion: ObjectAssertion<CategoryData> = {
          value: category,
          valueName: category.category,
          allowedProperties: ['docs', 'children', 'category'],
        };
        itValidatesType(
          (validatorFactory) => {
            // act
            new TestContext()
              .withData(category)
              .withValidatorFactory(validatorFactory)
              .parseCategory();
            // assert
            return {
              assertValidation: (validator) => validator.assertObject(expectedAssertion),
              expectedErrorContext: expectedContext,
            };
          },
        );
      });
    });
    describe('children', () => {
      describe('validates children for non-empty collection', () => {
        // arrange
        const category = new CategoryDataStub()
          .withChildren([createScriptDataWithCode()]);
        const expectedContext: CategoryErrorContext = {
          type: ExecutableType.Category,
          self: category,
        };
        const expectedAssertion: NonEmptyCollectionAssertion = {
          value: category.children,
          valueName: category.category,
        };
        itValidatesType(
          (validatorFactory) => {
            // act
            new TestContext()
              .withData(category)
              .withValidatorFactory(validatorFactory)
              .parseCategory();
            // assert
            return {
              assertValidation: (validator) => validator.assertObject(expectedAssertion),
              expectedErrorContext: expectedContext,
            };
          },
        );
      });
      describe('validates that a child is a category or a script', () => {
        // arrange
        const testScenarios = generateDataValidationTestScenarios<ExecutableData>({
          expectFail: [{
            description: 'child has incorrect properties',
            data: { property: 'non-empty-value' } as unknown as ExecutableData,
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
                const expectedError = 'Executable is neither a category or a script.';
                const parent = new CategoryDataStub()
                  .withName('parent')
                  .withChildren([new CategoryDataStub().withName('valid child'), childData]);
                const expectedContext: UnknownExecutableErrorContext = {
                  self: childData,
                  parentCategory: parent,
                };
                // act
                new TestContext()
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
        describe('validates (1th-level) child type', () => {
          // arrange
          const expectedName = 'child category';
          const child = new CategoryDataStub()
            .withName(expectedName);
          const parent = new CategoryDataStub()
            .withName('parent')
            .withChildren([child]);
          const expectedContext: UnknownExecutableErrorContext = {
            self: child,
            parentCategory: parent,
          };
          const expectedAssertion: ObjectAssertion<unknown> = {
            value: child,
            valueName: 'Executable',
          };
          itValidatesType(
            (validatorFactory) => {
              // act
              new TestContext()
                .withData(parent)
                .withValidatorFactory(validatorFactory)
                .parseCategory();
              // assert
              return {
                assertValidation: (validator) => validator.assertObject(expectedAssertion),
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
          const expectedContext: CategoryErrorContext = {
            type: ExecutableType.Category,
            self: grandChild,
            parentCategory: child,
          };
          itValidatesName((validatorFactory) => {
            // act
            new TestContext()
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
      describe('parses correct subscript', () => {
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
          const actualCategory = new TestContext()
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
          const actualCategory = new TestContext()
            .withScriptParser(scriptParser.get())
            .withData(categoryData)
            .withCategoryFactory(categoryFactorySpy)
            .parseCategory();
          // assert
          const actualParsedScripts = getInitParameters(actualCategory)?.scripts;
          expectExists(actualParsedScripts);
          expectArrayEquals(actualParsedScripts, expectedScripts, {
            ignoreOrder: true,
          });
        });
        it('parses all scripts with correct context', () => {
          // arrange
          const expectedContext = new CategoryCollectionContextStub();
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
          const actualCategory = new TestContext()
            .withData(categoryData)
            .withCollectionContext(expectedContext)
            .withScriptParser(scriptParser.get())
            .withCategoryFactory(categoryFactorySpy)
            .parseCategory();
          // assert
          const actualParsedScripts = getInitParameters(actualCategory)?.scripts;
          expectExists(actualParsedScripts);
          const actualContext = actualParsedScripts.map(
            (s) => scriptParser.getParseParameters(s)[1],
          );
          expect(
            actualContext.every(
              (actual) => actual === expectedContext,
            ),
            formatAssertionMessage([
              `Expected all elements to be ${JSON.stringify(expectedContext)}`,
              'All elements:',
              indentText(JSON.stringify(actualContext)),
            ]),
          ).to.equal(true);
        });
      });
      it('parses correct subcategories', () => {
        // arrange
        const expectedChildCategory = new CategoryStub('expected-child-category');
        const childCategoryData = new CategoryDataStub()
          .withName('expected child category')
          .withChildren([createScriptDataWithCode()]);
        const categoryData = new CategoryDataStub()
          .withName('category name')
          .withChildren([childCategoryData]);
        const { categoryFactorySpy, getInitParameters } = createCategoryFactorySpy();
        // act
        const actualCategory = new TestContext()
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
    describe('category creation', () => {
      it('creates category from the factory', () => {
        // arrange
        const expectedCategory = new CategoryStub('expected-category');
        const categoryFactory: CategoryFactory = () => expectedCategory;
        // act
        const actualCategory = new TestContext()
          .withCategoryFactory(categoryFactory)
          .parseCategory();
        // assert
        expect(actualCategory).to.equal(expectedCategory);
      });
      describe('rethrows exception if category factory fails', () => {
        // arrange
        const givenData = new CategoryDataStub();
        const expectedContextMessage = 'Failed to parse category.';
        const expectedError = new Error();
        // act & assert
        itThrowsContextualError({
          throwingAction: (wrapError) => {
            const validatorStub = new ExecutableValidatorStub();
            validatorStub.createContextualErrorMessage = (message) => message;
            const factoryMock: CategoryFactory = () => {
              throw expectedError;
            };
            new TestContext()
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
    });
  });
});

class TestContext {
  private data: CategoryData = new CategoryDataStub();

  private collectionContext: CategoryCollectionContextStub = new CategoryCollectionContextStub();

  private categoryFactory: CategoryFactory = createCategoryFactorySpy().categoryFactorySpy;

  private errorWrapper: ErrorWithContextWrapper = new ErrorWrapperStub().get();

  private validatorFactory: ExecutableValidatorFactory = createExecutableValidatorFactoryStub;

  private docsParser: DocsParser = () => ['docs'];

  private scriptParser: ScriptParser = new ScriptParserStub().get();

  public withData(data: CategoryData) {
    this.data = data;
    return this;
  }

  public withCollectionContext(
    collectionContext: CategoryCollectionContextStub,
  ): this {
    this.collectionContext = collectionContext;
    return this;
  }

  public withCategoryFactory(categoryFactory: CategoryFactory): this {
    this.categoryFactory = categoryFactory;
    return this;
  }

  public withValidatorFactory(validatorFactory: ExecutableValidatorFactory): this {
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
      this.collectionContext,
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
