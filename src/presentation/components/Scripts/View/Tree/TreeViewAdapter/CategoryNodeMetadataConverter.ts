import { ICategory, IScript } from '@/domain/ICategory';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { NodeMetadata, NodeType } from '../NodeContent/NodeMetadata';

export function parseAllCategories(collection: ICategoryCollection): NodeMetadata[] | undefined {
  return createCategoryNodes(collection.actions);
}

export function parseSingleCategory(
  categoryId: number,
  collection: ICategoryCollection,
): NodeMetadata[] | undefined {
  const category = collection.findCategory(categoryId);
  if (!category) {
    throw new Error(`Category with id ${categoryId} does not exist`);
  }
  const tree = parseCategoryRecursively(category);
  return tree;
}

export function getScriptNodeId(script: IScript): string {
  return script.id;
}

export function getScriptId(nodeId: string): string {
  return nodeId;
}

export function getCategoryId(nodeId: string): number {
  return +nodeId;
}

export function getCategoryNodeId(category: ICategory): string {
  return `${category.id}`;
}

function parseCategoryRecursively(
  parentCategory: ICategory,
): NodeMetadata[] {
  return [
    ...createCategoryNodes(parentCategory.subCategories),
    ...createScriptNodes(parentCategory.scripts),
  ];
}

function createScriptNodes(scripts: ReadonlyArray<IScript>): NodeMetadata[] {
  return (scripts || [])
    .map((script) => convertScriptToNode(script));
}

function createCategoryNodes(categories: ReadonlyArray<ICategory>): NodeMetadata[] {
  return (categories || [])
    .map((category) => ({ category, children: parseCategoryRecursively(category) }))
    .map((data) => convertCategoryToNode(data.category, data.children));
}

function convertCategoryToNode(
  category: ICategory,
  children: readonly NodeMetadata[],
): NodeMetadata {
  return {
    id: getCategoryNodeId(category),
    type: NodeType.Category,
    text: category.name,
    children,
    docs: category.docs,
    isReversible: children && children.every((child) => child.isReversible),
  };
}

function convertScriptToNode(script: IScript): NodeMetadata {
  return {
    id: getScriptNodeId(script),
    type: NodeType.Script,
    text: script.name,
    children: undefined,
    docs: script.docs,
    isReversible: script.canRevert(),
  };
}
