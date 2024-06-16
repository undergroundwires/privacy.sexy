import { describe, it, expect } from 'vitest';
import type { Script } from '@/domain/Executables/Script/Script';
import type { Category } from '@/domain/Executables/Category/Category';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import {
  createExecutableIdFromNodeId,
  createNodeIdForExecutable,
  parseAllCategories,
  parseSingleCategory,
} from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/CategoryNodeMetadataConverter';
import { ExecutableType } from '@/application/Parser/Executable/Validation/ExecutableType';
import type { NodeMetadata } from '@/presentation/components/Scripts/View/Tree/NodeContent/NodeMetadata';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import type { ExecutableId } from '@/domain/Executables/Identifiable/Identifiable';

describe('CategoryNodeMetadataConverter', () => {
  it('can convert script id and back', () => {
    // arrange
    const expectedScriptId: ExecutableId = 'expected-script-id';
    const script = new ScriptStub(expectedScriptId);
    // act
    const nodeId = createNodeIdForExecutable(script);
    const actualScriptId = createExecutableIdFromNodeId(nodeId);
    // assert
    expect(actualScriptId).to.equal(expectedScriptId);
  });
  it('can convert category id and back', () => {
    // arrange
    const expectedCategoryId: ExecutableId = 'expected-category-id';
    const category = new CategoryStub(expectedCategoryId);
    // act
    const nodeId = createNodeIdForExecutable(category);
    const actualCategoryId = createExecutableIdFromNodeId(nodeId);
    // assert
    expect(actualCategoryId).to.equal(expectedCategoryId);
  });
  describe('parseSingleCategory', () => {
    it('throws error if parent category cannot be retrieved', () => {
      // arrange
      const expectedError = 'error from collection';
      const collection = new CategoryCollectionStub();
      collection.getCategory = () => { throw new Error(expectedError); };
      // act
      const act = () => parseSingleCategory('unimportant-id', collection);
      // assert
      expect(act).to.throw(expectedError);
    });
    it('can parse when category has sub categories', () => {
      // arrange
      const parentCategoryId: ExecutableId = 'parent-category';
      const firstSubcategory = new CategoryStub('subcategory-1')
        .withScriptIds('subcategory-1-script-1', 'subcategory-1-script-2');
      const secondSubCategory = new CategoryStub('subcategory-2')
        .withCategory(
          new CategoryStub('subcategory-2-subcategory-1')
            .withScriptIds('subcategory-2-subcategory-1-script-1', 'subcategory-2-subcategory-1-script-2'),
        )
        .withCategory(
          new CategoryStub('subcategory-2-subcategory-2')
            .withScriptIds('subcategory-2-subcategory-2-script-1'),
        );
      const collection = new CategoryCollectionStub().withAction(
        new CategoryStub(parentCategoryId)
          .withCategory(firstSubcategory)
          .withCategory(secondSubCategory),
      );
      // act
      const nodes = parseSingleCategory(parentCategoryId, collection);
      // assert
      expectExists(nodes);
      expect(nodes).to.have.lengthOf(2);
      expectSameCategory(nodes[0], firstSubcategory);
      expectSameCategory(nodes[1], secondSubCategory);
    });
    it('can parse when category has sub scripts', () => {
      // arrange
      const categoryId: ExecutableId = 'expected-category-id';
      const scripts: readonly Script[] = [
        new ScriptStub('script1'),
        new ScriptStub('script2'),
        new ScriptStub('script3'),
      ];
      const collection = new CategoryCollectionStub()
        .withAction(new CategoryStub(categoryId).withScripts(...scripts));
      // act
      const nodes = parseSingleCategory(categoryId, collection);
      // assert
      expectExists(nodes);
      expect(nodes).to.have.lengthOf(3);
      expectSameScript(nodes[0], scripts[0]);
      expectSameScript(nodes[1], scripts[1]);
      expectSameScript(nodes[2], scripts[2]);
    });
  });
  it('parseAllCategories parses as expected', () => {
    // arrange
    const collection = new CategoryCollectionStub()
      .withAction(new CategoryStub('category-1').withScriptIds('1, 2'))
      .withAction(new CategoryStub('category-2').withCategories(
        new CategoryStub('category-2-subcategory-1').withScriptIds('3', '4'),
        new CategoryStub('category-2-subcategory-1')
          .withCategory(new CategoryStub('category-2-subcategory-1-subcategory-1').withScriptIds('6')),
      ));
    // act
    const nodes = parseAllCategories(collection);
    // assert
    expectExists(nodes);
    expect(nodes).to.have.lengthOf(2);
    expectSameCategory(nodes[0], collection.actions[0]);
    expectSameCategory(nodes[1], collection.actions[1]);
  });
});

function isReversible(category: Category): boolean {
  if (category.scripts) {
    if (category.scripts.some((s) => !s.canRevert())) {
      return false;
    }
  }
  if (category.subcategories) {
    if (category.subcategories.some((c) => !isReversible(c))) {
      return false;
    }
  }
  return true;
}

function expectSameCategory(node: NodeMetadata, category: Category): void {
  expect(node.type).to.equal(ExecutableType.Category, getErrorMessage('type'));
  expect(node.id).to.equal(createNodeIdForExecutable(category), getErrorMessage('id'));
  expect(node.docs).to.equal(category.docs, getErrorMessage('docs'));
  expect(node.text).to.equal(category.name, getErrorMessage('name'));
  expect(node.isReversible).to.equal(isReversible(category), getErrorMessage('isReversible'));
  expect(node.children).to.have.lengthOf(
    category.scripts.length + category.subcategories.length,
    getErrorMessage('total children'),
  );
  if (category.subcategories) {
    for (let i = 0; i < category.subcategories.length; i++) {
      expectSameCategory(node.children[i], category.subcategories[i]);
    }
  }
  if (category.scripts) {
    for (let i = 0; i < category.scripts.length; i++) {
      expectSameScript(node.children[i], category.scripts[i]);
    }
  }
  function getErrorMessage(field: string) {
    return `Unexpected node field: ${field}.\n`
      + `\nActual node:\n${print(node)}`
      + `\nExpected category:\n${print(category)}`;
  }
}

function expectSameScript(node: NodeMetadata, script: Script): void {
  expect(node.type).to.equal(ExecutableType.Script, getErrorMessage('type'));
  expect(node.id).to.equal(createNodeIdForExecutable(script), getErrorMessage('id'));
  expect(node.docs).to.equal(script.docs, getErrorMessage('docs'));
  expect(node.text).to.equal(script.name, getErrorMessage('name'));
  expect(node.isReversible).to.equal(script.canRevert(), getErrorMessage('canRevert'));
  expect(node.children).to.have.lengthOf(0);
  function getErrorMessage(field: string) {
    return `Unexpected node field: ${field}.`
      + `\nActual node:\n${print(node)}\n`
      + `\nExpected script:\n${print(script)}`;
  }
}

function print(object: unknown) {
  return JSON.stringify(object, null, 2);
}
