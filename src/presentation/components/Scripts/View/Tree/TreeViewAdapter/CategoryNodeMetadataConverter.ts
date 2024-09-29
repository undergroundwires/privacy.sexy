import type { Category } from '@/domain/Executables/Category/Category';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { Script } from '@/domain/Executables/Script/Script';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
import type { Executable } from '@/domain/Executables/Executable';
import { type NodeMetadata, NodeType } from '../NodeContent/NodeMetadata';
import type { TreeNodeId } from '../TreeView/Node/TreeNode';

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

export function createNodeIdForExecutable(executable: Executable): TreeNodeId {
  return executable.executableId;
}

export function createExecutableIdFromNodeId(nodeId: TreeNodeId): ExecutableId {
  return nodeId;
}

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
    executableId: createNodeIdForExecutable(category),
    type: NodeType.Category,
    text: category.name,
    children,
    docs: category.docs,
    isReversible: children && children.every((child) => child.isReversible),
  };
}

function convertScriptToNode(script: Script): NodeMetadata {
  return {
    executableId: createNodeIdForExecutable(script),
    type: NodeType.Script,
    text: script.name,
    children: [],
    docs: script.docs,
    isReversible: script.canRevert(),
  };
}
