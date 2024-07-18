import { describe, it, expect } from 'vitest';
import type { CategoryData, ExecutableData } from '@/application/collections/';
import { type CategoryFactory, parseCategory } from '@/application/Parser/Executable/CategoryParser';
import { type ScriptParser } from '@/application/Parser/Executable/Script/ScriptParser';
import { type DocsParser } from '@/application/Parser/Executable/DocumentationParser';
import { CategoryCollectionSpecificUtilitiesStub } from '@tests/unit/shared/Stubs/CategoryCollectionSpecificUtilitiesStub';
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
import { itThrowsContextualError } from '../Common/ContextualErrorTester';
import { itValidatesName, itValidatesType, itAsserts } from './Validation/ExecutableValidationTester';
import { generateDataValidationTestScenarios } from './Validation/DataValidationTestScenarioGenerator';

describe('CategoryParser', () => {
  describe('parseCategory', () => {
    describe('validation', () => {
      describe('validates for name', () => {
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
      describe('validates for unknown object', () => {
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
            new TestBuilder()
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
            new TestBuilder()
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
            new TestBuilder()
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
              new TestBuilder()
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
          const validatorStub = new ExecutableValidatorStub();
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
      it('parses all scripts with correct utilities', () => {
        // arrange
        const expected = new CategoryCollectionSpecificUtilitiesStub();
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
          .withCollectionUtilities(expected)
          .withScriptParser(scriptParser.get())
          .withCategoryFactory(categoryFactorySpy)
          .parseCategory();
        // assert
        const actualParsedScripts = getInitParameters(actualCategory)?.scripts;
        expectExists(actualParsedScripts);
        const actualUtilities = actualParsedScripts.map(
          (s) => scriptParser.getParseParameters(s)[1],
        );
        expect(
          actualUtilities.every(
            (actual) => actual === expected,
          ),
          formatAssertionMessage([
            `Expected all elements to be ${JSON.stringify(expected)}`,
            'All elements:',
            indentText(JSON.stringify(actualUtilities)),
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

  private collectionUtilities:
  CategoryCollectionSpecificUtilitiesStub = new CategoryCollectionSpecificUtilitiesStub();

  private categoryFactory: CategoryFactory = () => new CategoryStub(33);

  private errorWrapper: ErrorWithContextWrapper = new ErrorWrapperStub().get();

  private validatorFactory: ExecutableValidatorFactory = createExecutableValidatorFactoryStub;

  private docsParser: DocsParser = () => ['docs'];

  private scriptParser: ScriptParser = new ScriptParserStub().get();

  public withData(data: CategoryData) {
    this.data = data;
    return this;
  }

  public withCollectionUtilities(
    collectionUtilities: CategoryCollectionSpecificUtilitiesStub,
  ): this {
    this.collectionUtilities = collectionUtilities;
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
      this.collectionUtilities,
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
