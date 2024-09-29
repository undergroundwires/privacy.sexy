import { describe, it, expect } from 'vitest';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';
import { createCategory } from '@/domain/Executables/Category/CategoryFactory';
import type { ExecutableId } from '@/domain/Executables/Identifiable';

describe('CategoryFactory', () => {
  describe('createCategory', () => {
    describe('id', () => {
      it('assigns id correctly', () => {
        // arrange
        const expectedId: ExecutableId = 'expected category id';
        // act
        const category = new TestContext()
          .withExecutableId(expectedId)
          .build();
        // assert
        const actualId = category.executableId;
        expect(actualId).to.equal(expectedId);
      });
      describe('throws error if id is absent', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const expectedError = 'missing ID';
          const id = absentValue;
          // act
          const construct = () => new TestContext()
            .withExecutableId(id)
            .build();
          // assert
          expect(construct).to.throw(expectedError);
        }, { excludeNull: true, excludeUndefined: true });
      });
    });
    describe('name', () => {
      it('assigns name correctly', () => {
        // arrange
        const expectedName = 'expected category name';
        // act
        const category = new TestContext()
          .withName(expectedName)
          .build();
        // assert
        const actualName = category.name;
        expect(actualName).to.equal(expectedName);
      });
      describe('throws error if name is absent', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const expectedError = 'missing name';
          const name = absentValue;
          // act
          const construct = () => new TestContext()
            .withName(name)
            .build();
          // assert
          expect(construct).to.throw(expectedError);
        }, { excludeNull: true, excludeUndefined: true });
      });
    });
    describe('docs', () => {
      it('assigns docs correctly', () => {
        // arrange
        const expectedDocs = ['expected', 'docs'];
        // act
        const category = new TestContext()
          .withDocs(expectedDocs)
          .build();
        // assert
        const actualDocs = category.docs;
        expect(actualDocs).to.equal(expectedDocs);
      });
    });
    describe('children', () => {
      it('assigns scripts correctly', () => {
        // arrange
        const expectedScripts = [
          new ScriptStub('expected-script-1'),
          new ScriptStub('expected-script-2'),
        ];
        // act
        const category = new TestContext()
          .withScripts(expectedScripts)
          .build();
        // assert
        const actualScripts = category.scripts;
        expect(actualScripts).to.equal(expectedScripts);
      });
      it('assigns categories correctly', () => {
        // arrange
        const expectedCategories = [
          new CategoryStub('expected-subcategory-1'),
          new CategoryStub('expected-subcategory-2'),
        ];
        // act
        const category = new TestContext()
          .withSubcategories(expectedCategories)
          .build();
        // assert
        const actualCategories = category.subcategories;
        expect(actualCategories).to.equal(expectedCategories);
      });
      it('throws error if no children are present', () => {
        // arrange
        const expectedError = 'A category must have at least one sub-category or script';
        const scriptChildren: readonly Script[] = [];
        const categoryChildren: readonly Category[] = [];
        // act
        const construct = () => new TestContext()
          .withSubcategories(categoryChildren)
          .withScripts(scriptChildren)
          .build();
        // assert
        expect(construct).to.throw(expectedError);
      });
    });
    describe('getAllScriptsRecursively', () => {
      it('retrieves direct child scripts', () => {
        // arrange
        const expectedScripts: readonly Script[] = [
          new ScriptStub('expected-script-1'),
          new ScriptStub('expected-script-2'),
        ];
        const category = new TestContext()
          .withScripts(expectedScripts)
          .build();
        // act
        const actual = category.getAllScriptsRecursively();
        // assert
        expect(actual).to.have.deep.members(expectedScripts);
      });
      it('retrieves scripts from direct child categories', () => {
        // arrange
        const expectedScriptIds: readonly string[] = [
          '1', '2', '3', '4',
        ];
        const subcategories: readonly Category[] = [
          new CategoryStub('subcategory-1').withScriptIds('1', '2'),
          new CategoryStub('subcategory-2').withScriptIds('3', '4'),
        ];
        const category = new TestContext()
          .withScripts([])
          .withSubcategories(subcategories)
          .build();
        // act
        const actualIds = category
          .getAllScriptsRecursively()
          .map((s) => s.executableId);
        // assert
        expect(actualIds).to.have.deep.members(expectedScriptIds);
      });
      it('retrieves scripts from both direct children and child categories', () => {
        // arrange
        const expectedScriptIds: readonly string[] = [
          '1', '2', '3', '4', '5', '6',
        ];
        const subcategories: readonly Category[] = [
          new CategoryStub('subcategory-1').withScriptIds('1', '2'),
          new CategoryStub('subcategory-2').withScriptIds('3', '4'),
        ];
        const scripts: readonly Script[] = [
          new ScriptStub('5'),
          new ScriptStub('6'),
        ];
        const category = new TestContext()
          .withSubcategories(subcategories)
          .withScripts(scripts)
          .build();
        // act
        const actualIds = category
          .getAllScriptsRecursively()
          .map((s) => s.executableId);
        // assert
        expect(actualIds).to.have.deep.members(expectedScriptIds);
      });
      it('retrieves scripts from nested categories recursively', () => {
        // arrange
        const expectedScriptIds: readonly string[] = [
          '1', '2', '3', '4', '5', '6',
        ];
        const subcategories: readonly Category[] = [
          new CategoryStub('subcategory-1')
            .withScriptIds('1', '2')
            .withCategory(
              new CategoryStub('subcategory-1-subcategory-1')
                .withScriptIds('3', '4'),
            ),
          new CategoryStub('subcategory-2')
            .withCategories(
              new CategoryStub('subcategory-2-subcategory-1')
                .withScriptIds('5')
                .withCategory(
                  new CategoryStub('subcategory-2-subcategory-1-subcategory-1')
                    .withCategory(
                      new CategoryStub('subcategory-2-subcategory-1-subcategory-1-subcategory-1')
                        .withScriptIds('6'),
                    ),
                ),
            ),
        ];
        // assert
        const category = new TestContext()
          .withScripts([])
          .withSubcategories(subcategories)
          .build();
        // act
        const actualIds = category
          .getAllScriptsRecursively()
          .map((s) => s.executableId);
        // assert
        expect(actualIds).to.have.deep.members(expectedScriptIds);
      });
    });
    describe('includes', () => {
      it('returns false for scripts not included', () => {
        // assert
        const expectedResult = false;
        const script = new ScriptStub('3');
        const childCategory = new CategoryStub('subcategory')
          .withScriptIds('1', '2');
        const category = new TestContext()
          .withSubcategories([childCategory])
          .build();
        // act
        const actual = category.includes(script);
        // assert
        expect(actual).to.equal(expectedResult);
      });
      it('returns true for scripts directly included', () => {
        // assert
        const expectedResult = true;
        const script = new ScriptStub('3');
        const childCategory = new CategoryStub('subcategory')
          .withScript(script)
          .withScriptIds('non-related');
        const category = new TestContext()
          .withSubcategories([childCategory])
          .build();
        // act
        const actual = category.includes(script);
        // assert
        expect(actual).to.equal(expectedResult);
      });
      it('returns true for scripts included in nested categories', () => {
        // assert
        const expectedResult = true;
        const script = new ScriptStub('3');
        const childCategory = new CategoryStub('subcategory')
          .withScriptIds('non-related')
          .withCategory(
            new CategoryStub('nested-subcategory')
              .withScript(script),
          );
        const category = new TestContext()
          .withSubcategories([childCategory])
          .build();
        // act
        const actual = category.includes(script);
        // assert
        expect(actual).to.equal(expectedResult);
      });
    });
  });
});

class TestContext {
  private executableId: ExecutableId = `[${TestContext.name}] test category`;

  private name = 'test-category';

  private docs: ReadonlyArray<string> = [];

  private subcategories: ReadonlyArray<Category> = [];

  private scripts: ReadonlyArray<Script> = [
    new ScriptStub(`[${TestContext.name}] script`),
  ];

  public withExecutableId(executableId: ExecutableId): this {
    this.executableId = executableId;
    return this;
  }

  public withName(name: string): this {
    this.name = name;
    return this;
  }

  public withDocs(docs: ReadonlyArray<string>): this {
    this.docs = docs;
    return this;
  }

  public withScripts(scripts: ReadonlyArray<Script>): this {
    this.scripts = scripts;
    return this;
  }

  public withSubcategories(subcategories: ReadonlyArray<Category>): this {
    this.subcategories = subcategories;
    return this;
  }

  public build(): ReturnType<typeof createCategory> {
    return createCategory({
      executableId: this.executableId,
      name: this.name,
      docs: this.docs,
      subcategories: this.subcategories,
      scripts: this.scripts,
    });
  }
}
