import { describe, it, expect } from 'vitest';
import type { CategoryData, CategoryOrScriptData } from '@/application/collections/';
import { CategoryFactoryType, parseCategory } from '@/application/Parser/CategoryParser';
import { parseScript } from '@/application/Parser/Script/ScriptParser';
import { parseDocs } from '@/application/Parser/DocumentationParser';
import { ScriptCompilerStub } from '@tests/unit/shared/Stubs/ScriptCompilerStub';
import { CategoryCollectionParseContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionParseContextStub';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { CategoryDataStub } from '@tests/unit/shared/Stubs/CategoryDataStub';
import { itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { NodeType } from '@/application/Parser/NodeValidation/NodeType';
import { expectThrowsNodeError, ITestScenario, NodeValidationTestRunner } from '@tests/unit/application/Parser/NodeValidation/NodeValidatorTestRunner';
import { ICategoryCollectionParseContext } from '@/application/Parser/Script/ICategoryCollectionParseContext';
import { Category } from '@/domain/Category';
import { createScriptDataWithCall, createScriptDataWithCode, createScriptDataWithoutCallOrCodes } from '@tests/unit/shared/Stubs/ScriptDataStub';

describe('CategoryParser', () => {
  describe('parseCategory', () => {
    describe('invalid category data', () => {
      describe('validates script data', () => {
        describe('satisfies shared node tests', () => {
          new NodeValidationTestRunner()
            .testInvalidNodeName((invalidName) => {
              return createTest(
                new CategoryDataStub().withName(invalidName),
              );
            })
            .testMissingNodeData((node) => {
              return createTest(node as CategoryData);
            });
        });
        describe('throws when category children is absent', () => {
          itEachAbsentCollectionValue<CategoryOrScriptData>((absentValue) => {
            // arrange
            const categoryName = 'test';
            const expectedMessage = `"${categoryName}" has no children.`;
            const category = new CategoryDataStub()
              .withName(categoryName)
              .withChildren(absentValue);
            // act
            const test = createTest(category);
            // assert
            expectThrowsNodeError(test, expectedMessage);
          }, { excludeUndefined: true, excludeNull: true });
        });
        describe('throws when category child is missing', () => {
          new NodeValidationTestRunner()
            .testMissingNodeData((missingNode) => {
              // arrange
              const invalidChildNode = missingNode;
              const parent = new CategoryDataStub()
                .withName('parent')
                .withChildren([new CategoryDataStub().withName('valid child'), invalidChildNode]);
              return ({
                // act
                act: () => new TestBuilder()
                  .withData(parent)
                  .parseCategory(),
                // assert
                expectedContext: {
                  selfNode: invalidChildNode,
                  parentNode: parent,
                },
              });
            });
        });
        it('throws when node is neither a category or a script', () => {
          // arrange
          const expectedError = 'Node is neither a category or a script.';
          const invalidChildNode = { property: 'non-empty-value' } as never as CategoryOrScriptData;
          const parent = new CategoryDataStub()
            .withName('parent')
            .withChildren([new CategoryDataStub().withName('valid child'), invalidChildNode]);
          // act
          const test: ITestScenario = {
            // act
            act: () => new TestBuilder()
              .withData(parent)
              .parseCategory(),
            // assert
            expectedContext: {
              selfNode: invalidChildNode,
              parentNode: parent,
            },
          };
          // assert
          expectThrowsNodeError(test, expectedError);
        });
        describe('throws when category child is invalid category', () => {
          new NodeValidationTestRunner().testInvalidNodeName((invalidName) => {
            // arrange
            const invalidChildNode = new CategoryDataStub()
              .withName(invalidName);
            const parent = new CategoryDataStub()
              .withName('parent')
              .withChildren([new CategoryDataStub().withName('valid child'), invalidChildNode]);
            return ({
              // act
              act: () => new TestBuilder()
                .withData(parent)
                .parseCategory(),
              // assert
              expectedContext: {
                type: NodeType.Category,
                selfNode: invalidChildNode,
                parentNode: parent,
              },
            });
          });
        });
        function createTest(category: CategoryData): ITestScenario {
          return {
            act: () => new TestBuilder()
              .withData(category)
              .parseCategory(),
            expectedContext: {
              type: NodeType.Category,
              selfNode: category,
            },
          };
        }
      });
      it(`rethrows exception if ${Category.name} cannot be constructed`, () => {
        // arrange
        const expectedError = 'category creation failed';
        const factoryMock: CategoryFactoryType = () => { throw new Error(expectedError); };
        const data = new CategoryDataStub();
        // act
        const act = () => new TestBuilder()
          .withData(data)
          .withFactory(factoryMock)
          .parseCategory();
        // expect
        expectThrowsNodeError({
          act,
          expectedContext: {
            type: NodeType.Category,
            selfNode: data,
          },
        }, expectedError);
      });
    });
    it('returns expected docs', () => {
      // arrange
      const url = 'https://privacy.sexy';
      const expected = parseDocs({ docs: url });
      const category = new CategoryDataStub()
        .withDocs(url);
      // act
      const actual = new TestBuilder()
        .withData(category)
        .parseCategory()
        .docs;
      // assert
      expect(actual).to.deep.equal(expected);
    });
    describe('parses expected subscript', () => {
      it('single script with code', () => {
        // arrange
        const script = createScriptDataWithCode();
        const context = new CategoryCollectionParseContextStub();
        const expected = [parseScript(script, context)];
        const category = new CategoryDataStub()
          .withChildren([script]);
        // act
        const actual = new TestBuilder()
          .withData(category)
          .withContext(context)
          .parseCategory()
          .scripts;
        // assert
        expect(actual).to.deep.equal(expected);
      });
      it('single script with function call', () => {
        // arrange
        const script = createScriptDataWithCall();
        const compiler = new ScriptCompilerStub()
          .withCompileAbility(script);
        const context = new CategoryCollectionParseContextStub()
          .withCompiler(compiler);
        const expected = [parseScript(script, context)];
        const category = new CategoryDataStub()
          .withChildren([script]);
        // act
        const actual = new TestBuilder()
          .withData(category)
          .withContext(context)
          .parseCategory()
          .scripts;
        // assert
        expect(actual).to.deep.equal(expected);
      });
      it('multiple scripts with function call and code', () => {
        // arrange
        const callableScript = createScriptDataWithCall();
        const scripts = [callableScript, createScriptDataWithCode()];
        const category = new CategoryDataStub()
          .withChildren(scripts);
        const compiler = new ScriptCompilerStub()
          .withCompileAbility(callableScript);
        const context = new CategoryCollectionParseContextStub()
          .withCompiler(compiler);
        const expected = scripts.map((script) => parseScript(script, context));
        // act
        const actual = new TestBuilder()
          .withData(category)
          .withContext(context)
          .parseCategory()
          .scripts;
        // assert
        expect(actual).to.deep.equal(expected);
      });
      it('script is created with right context', () => { // test through script validation logic
        // arrange
        const commentDelimiter = 'should not throw';
        const duplicatedCode = `${commentDelimiter} duplicate-line\n${commentDelimiter} duplicate-line`;
        const parseContext = new CategoryCollectionParseContextStub()
          .withSyntax(new LanguageSyntaxStub().withCommentDelimiters(commentDelimiter));
        const category = new CategoryDataStub()
          .withChildren([
            new CategoryDataStub()
              .withName('sub-category')
              .withChildren([
                createScriptDataWithoutCallOrCodes()
                  .withCode(duplicatedCode),
              ]),
          ]);
        // act
        const act = () => new TestBuilder()
          .withData(category)
          .withContext(parseContext)
          .parseCategory()
          .scripts;
        // assert
        expect(act).to.not.throw();
      });
    });
    it('returns expected subcategories', () => {
      // arrange
      const expected = [new CategoryDataStub()
        .withName('test category')
        .withChildren([createScriptDataWithCode()]),
      ];
      const category = new CategoryDataStub()
        .withName('category name')
        .withChildren(expected);
      // act
      const actual = new TestBuilder()
        .withData(category)
        .parseCategory()
        .subCategories;
      // assert
      expect(actual).to.have.lengthOf(1);
      expect(actual[0].name).to.equal(expected[0].category);
      expect(actual[0].scripts.length).to.equal(expected[0].children.length);
    });
  });
});

class TestBuilder {
  private data: CategoryData = new CategoryDataStub();

  private context: ICategoryCollectionParseContext = new CategoryCollectionParseContextStub();

  private factory?: CategoryFactoryType = undefined;

  public withData(data: CategoryData) {
    this.data = data;
    return this;
  }

  public withContext(context: ICategoryCollectionParseContext) {
    this.context = context;
    return this;
  }

  public withFactory(factory: CategoryFactoryType) {
    this.factory = factory;
    return this;
  }

  public parseCategory() {
    return parseCategory(this.data, this.context, this.factory);
  }
}
