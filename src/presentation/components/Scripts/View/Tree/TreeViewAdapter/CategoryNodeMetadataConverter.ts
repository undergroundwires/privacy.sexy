import type { ExecutableId, ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';
import { type NodeMetadata, NodeType } from '../NodeContent/NodeMetadata';

export function parseAllCategories(collection: CategoryCollection): NodeMetadata[] {
  return createCategoryNodes(collection.actions);
}

export function parseSingleCategory(
  categoryId: ExecutableId,
  collection: CategoryCollection,
): NodeMetadata[] {
  const category = collection.getCategory(categoryId);
  const tree = parseCategoryRecursively(category);
  return tree;
}

export function getScriptNodeId(script: Script): string {
  return convertExecutableIdToNodeId(script.key.executableId);
}

export function getScriptKey(
  nodeId: string,
  collection: CategoryCollection,
): ExecutableKey {
  const executableId = convertNodeIdToExecutableId(nodeId);
  const script = collection.getScript(executableId);
  return script.key;
}

export function getCategoryKey(
  nodeId: string,
  collection: CategoryCollection,
): ExecutableKey {
  const executableId = convertNodeIdToExecutableId(nodeId);
  const category = collection.getCategory(executableId);
  return category.key;
}

export function getCategoryNodeId(category: Category): string {
  return convertExecutableIdToNodeId(category.key.executableId);
}

function convertNodeIdToExecutableId(nodeId: string): ExecutableId {
  return nodeId;
}

function convertExecutableIdToNodeId(executableId: ExecutableId): string {
  return executableId;
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
