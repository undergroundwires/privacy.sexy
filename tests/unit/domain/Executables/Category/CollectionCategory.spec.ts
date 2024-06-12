import { describe, it, expect } from 'vitest';
import { CollectionCategory } from '@/domain/Executables/Category/CollectionCategory';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';

describe('CollectionCategory', () => {
  describe('ctor', () => {
    describe('throws error if name is absent', () => {
      itEachAbsentStringValue((absentValue) => {
        // arrange
        const expectedError = 'missing name';
        const name = absentValue;
        // act
        const construct = () => new CategoryBuilder()
          .withName(name)
          .build();
        // assert
        expect(construct).to.throw(expectedError);
      }, { excludeNull: true, excludeUndefined: true });
    });
    it('throws error if no children are present', () => {
      // arrange
      const expectedError = 'A category must have at least one sub-category or script';
      const scriptChildren: readonly Script[] = [];
      const categoryChildren: readonly Category[] = [];
      // act
      const construct = () => new CategoryBuilder()
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
      const expectedScripts = [new ScriptStub('1'), new ScriptStub('2')];
      const sut = new CategoryBuilder()
        .withScripts(expectedScripts)
        .build();
      // act
      const actual = sut.getAllScriptsRecursively();
      // assert
      expect(actual).to.have.deep.members(expectedScripts);
    });
    it('retrieves scripts from direct child categories', () => {
      // arrange
      const expectedScriptIds = ['1', '2', '3', '4'];
      const categories = [
        new CategoryStub(31).withScriptIds('1', '2'),
        new CategoryStub(32).withScriptIds('3', '4'),
      ];
      const sut = new CategoryBuilder()
        .withScripts([])
        .withSubcategories(categories)
        .build();
      // act
      const actualIds = sut
        .getAllScriptsRecursively()
        .map((s) => s.id);
      // assert
      expect(actualIds).to.have.deep.members(expectedScriptIds);
    });
    it('retrieves scripts from both direct children and child categories', () => {
      // arrange
      const expectedScriptIds = ['1', '2', '3', '4', '5', '6'];
      const categories = [
        new CategoryStub(31).withScriptIds('1', '2'),
        new CategoryStub(32).withScriptIds('3', '4'),
      ];
      const scripts = [new ScriptStub('5'), new ScriptStub('6')];
      const sut = new CategoryBuilder()
        .withSubcategories(categories)
        .withScripts(scripts)
        .build();
      // act
      const actualIds = sut
        .getAllScriptsRecursively()
        .map((s) => s.id);
      // assert
      expect(actualIds).to.have.deep.members(expectedScriptIds);
    });
    it('retrieves scripts from nested categories recursively', () => {
      // arrange
      const expectedScriptIds = ['1', '2', '3', '4', '5', '6'];
      const categories = [
        new CategoryStub(31)
          .withScriptIds('1', '2')
          .withCategory(
            new CategoryStub(32)
              .withScriptIds('3', '4'),
          ),
        new CategoryStub(33)
          .withCategories(
            new CategoryStub(34)
              .withScriptIds('5')
              .withCategory(
                new CategoryStub(35)
                  .withCategory(
                    new CategoryStub(35).withScriptIds('6'),
                  ),
              ),
          ),
      ];
      // assert
      const sut = new CategoryBuilder()
        .withScripts([])
        .withSubcategories(categories)
        .build();
      // act
      const actualIds = sut
        .getAllScriptsRecursively()
        .map((s) => s.id);
      // assert
      expect(actualIds).to.have.deep.members(expectedScriptIds);
    });
  });
  describe('includes', () => {
    it('returns false for scripts not included', () => {
      // assert
      const expectedResult = false;
      const script = new ScriptStub('3');
      const childCategory = new CategoryStub(33)
        .withScriptIds('1', '2');
      const sut = new CategoryBuilder()
        .withSubcategories([childCategory])
        .build();
      // act
      const actual = sut.includes(script);
      // assert
      expect(actual).to.equal(expectedResult);
    });
    it('returns true for scripts directly included', () => {
      // assert
      const expectedResult = true;
      const script = new ScriptStub('3');
      const childCategory = new CategoryStub(33)
        .withScript(script)
        .withScriptIds('non-related');
      const sut = new CategoryBuilder()
        .withSubcategories([childCategory])
        .build();
      // act
      const actual = sut.includes(script);
      // assert
      expect(actual).to.equal(expectedResult);
    });
    it('returns true for scripts included in nested categories', () => {
      // assert
      const expectedResult = true;
      const script = new ScriptStub('3');
      const childCategory = new CategoryStub(22)
        .withScriptIds('non-related')
        .withCategory(new CategoryStub(33).withScript(script));
      const sut = new CategoryBuilder()
        .withSubcategories([childCategory])
        .build();
      // act
      const actual = sut.includes(script);
      // assert
      expect(actual).to.equal(expectedResult);
    });
  });
});

class CategoryBuilder {
  private id = 3264;

  private name = 'test-script';

  private docs: ReadonlyArray<string> = [];

  private subcategories: ReadonlyArray<Category> = [];

  private scripts: ReadonlyArray<Script> = [
    new ScriptStub(`[${CategoryBuilder.name}] script`),
  ];

  public withId(id: number): this {
    this.id = id;
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

  public build(): CollectionCategory {
    return new CollectionCategory({
      id: this.id,
      name: this.name,
      docs: this.docs,
      subcategories: this.subcategories,
      scripts: this.scripts,
    });
  }
}
