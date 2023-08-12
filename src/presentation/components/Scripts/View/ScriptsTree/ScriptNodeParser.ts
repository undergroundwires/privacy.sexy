import { ICategory, IScript } from '@/domain/ICategory';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { INodeContent, NodeType } from './SelectableTree/Node/INodeContent';

export function parseAllCategories(collection: ICategoryCollection): INodeContent[] | undefined {
  return createCategoryNodes(collection.actions);
}

export function parseSingleCategory(
  categoryId: number,
  collection: ICategoryCollection,
): INodeContent[] | undefined {
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
): INodeContent[] {
  if (!parentCategory) {
    throw new Error('parentCategory is undefined');
  }
  return [
    ...createCategoryNodes(parentCategory.subCategories),
    ...createScriptNodes(parentCategory.scripts),
  ];
}

function createScriptNodes(scripts: ReadonlyArray<IScript>): INodeContent[] {
  return (scripts || [])
    .map((script) => convertScriptToNode(script));
}

function createCategoryNodes(categories: ReadonlyArray<ICategory>): INodeContent[] {
  return (categories || [])
    .map((category) => ({ category, children: parseCategoryRecursively(category) }))
    .map((data) => convertCategoryToNode(data.category, data.children));
}

function convertCategoryToNode(
  category: ICategory,
  children: readonly INodeContent[],
): INodeContent {
  return {
    id: getCategoryNodeId(category),
    type: NodeType.Category,
    text: category.name,
    children,
    docs: category.docs,
    isReversible: children && children.every((child) => child.isReversible),
  };
}

function convertScriptToNode(script: IScript): INodeContent {
  return {
    id: getScriptNodeId(script),
    type: NodeType.Script,
    text: script.name,
    children: undefined,
    docs: script.docs,
    isReversible: script.canRevert(),
  };
}
