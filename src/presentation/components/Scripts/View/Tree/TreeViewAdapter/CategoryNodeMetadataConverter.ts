import type { Category } from '@/domain/Executables/Category/Category';
import type { ICategoryCollection } from '@/domain/ICategoryCollection';
import type { Script } from '@/domain/Executables/Script/Script';
import { type NodeMetadata, NodeType } from '../NodeContent/NodeMetadata';

export function parseAllCategories(collection: ICategoryCollection): NodeMetadata[] {
  return createCategoryNodes(collection.actions);
}

export function parseSingleCategory(
  categoryId: number,
  collection: ICategoryCollection,
): NodeMetadata[] {
  const category = collection.getCategory(categoryId);
  const tree = parseCategoryRecursively(category);
  return tree;
}

export function getScriptNodeId(script: Script): string {
  return script.id;
}

export function getScriptId(nodeId: string): string {
  return nodeId;
}

export function getCategoryId(nodeId: string): number {
  return +nodeId;
}

export function getCategoryNodeId(category: Category): string {
  return `${category.id}`;
}

function parseCategoryRecursively(
  parentCategory: Category,
): NodeMetadata[] {
  return [
    ...createCategoryNodes(parentCategory.subCategories),
    ...createScriptNodes(parentCategory.scripts),
  ];
}

function createScriptNodes(scripts: ReadonlyArray<Script>): NodeMetadata[] {
  return (scripts || [])
    .map((script) => convertScriptToNode(script));
}

function createCategoryNodes(categories: ReadonlyArray<Category>): NodeMetadata[] {
  return (categories || [])
    .map((category) => ({ category, children: parseCategoryRecursively(category) }))
    .map((data) => convertCategoryToNode(data.category, data.children));
}

function convertCategoryToNode(
  category: Category,
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

function convertScriptToNode(script: Script): NodeMetadata {
  return {
    id: getScriptNodeId(script),
    type: NodeType.Script,
    text: script.name,
    children: [],
    docs: script.docs,
    isReversible: script.canRevert(),
  };
}
