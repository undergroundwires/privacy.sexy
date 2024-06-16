import type { ExecutableId, ExecutableKey } from '@/domain/Executables/Identifiable/ExecutableKey/ExecutableKey';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { Category } from '@/domain/Executables/Category/Category';
<<<<<<< HEAD
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
=======
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
import type { Script } from '@/domain/Executables/Script/Script';
import type { ExecutableId } from '@/domain/Executables/Identifiable/Identifiable';
import type { Executable } from '@/domain/Executables/Executable';
import { type NodeMetadata, NodeType } from '../NodeContent/NodeMetadata';
import type { TreeNodeId } from '../TreeView/Node/TreeNode';

export function parseAllCategories(collection: CategoryCollection): NodeMetadata[] {
  return createCategoryNodes(collection.actions);
}

export function parseSingleCategory(
  categoryId: ExecutableId,
<<<<<<< HEAD
  collection: ICategoryCollection,
=======
  collection: CategoryCollection,
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
): NodeMetadata[] {
  const category = collection.getCategory(categoryId);
  const tree = parseCategoryRecursively(category);
  return tree;
}

<<<<<<< HEAD
export function createNodeIdForExecutable(executable: Executable): TreeNodeId {
  return executable.executableId;
}

export function createExecutableIdFromNodeId(nodeId: TreeNodeId): ExecutableId {
  return nodeId;
}

=======
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

>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
function parseCategoryRecursively(
  parentCategory: Category,
): NodeMetadata[] {
  return [
    ...createCategoryNodes(parentCategory.subcategories),
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
    id: createNodeIdForExecutable(category),
    type: NodeType.Category,
    text: category.name,
    children,
    docs: category.docs,
    isReversible: children && children.every((child) => child.isReversible),
  };
}

function convertScriptToNode(script: Script): NodeMetadata {
  return {
    id: createNodeIdForExecutable(script),
    type: NodeType.Script,
    text: script.name,
    children: [],
    docs: script.docs,
    isReversible: script.canRevert(),
  };
}
