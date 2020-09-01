import { IApplication } from './../../../domain/IApplication';
import { ICategory, IScript } from '@/domain/ICategory';
import { INode, NodeType } from './SelectableTree/Node/INode';

export function parseAllCategories(app: IApplication): INode[] | undefined {
  const nodes = new Array<INode>();
  for (const category of app.actions) {
    const children = parseCategoryRecursively(category);
    nodes.push(convertCategoryToNode(category, children));
  }
  return nodes;
}

export function parseSingleCategory(categoryId: number, app: IApplication): INode[] | undefined {
  const category = app.findCategory(categoryId);
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
  parentCategory: ICategory): INode[] {
  if (!parentCategory) {
    throw new Error('parentCategory is undefined');
  }
  let nodes = new Array<INode>();
  nodes = addCategories(parentCategory.subCategories, nodes);
  nodes = addScripts(parentCategory.scripts, nodes);
  return nodes;
}

function addScripts(scripts: ReadonlyArray<IScript>, nodes: INode[]): INode[] {
  if (!scripts || scripts.length === 0) {
    return nodes;
  }
  for (const script of scripts) {
    nodes.push(convertScriptToNode(script));
  }
  return nodes;
}

function addCategories(categories: ReadonlyArray<ICategory>, nodes: INode[]): INode[] {
  if (!categories || categories.length === 0) {
    return nodes;
  }
  for (const category of categories) {
    const subCategoryNodes = parseCategoryRecursively(category);
    nodes.push(convertCategoryToNode(category, subCategoryNodes));
  }
  return nodes;
}

function convertCategoryToNode(
  category: ICategory, children: readonly INode[]): INode {
  return {
    id: getCategoryNodeId(category),
    type: NodeType.Category,
    text: category.name,
    children,
    documentationUrls: category.documentationUrls,
    isReversible: children && children.every((child) => child.isReversible),
  };
}

function convertScriptToNode(script: IScript): INode {
  return {
    id: getScriptNodeId(script),
    type: NodeType.Script,
    text: script.name,
    children: undefined,
    documentationUrls: script.documentationUrls,
    isReversible: script.canRevert(),
  };
}
