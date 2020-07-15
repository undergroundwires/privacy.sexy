import { IApplication } from './../../../domain/IApplication';
import { ICategory, IScript } from '@/domain/ICategory';
import { INode } from './SelectableTree/INode';

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

export function getCategoryNodeId(category: ICategory): string {
  return `Category${category.id}`;
}

function parseCategoryRecursively(
  parentCategory: ICategory): INode[] {
  if (!parentCategory) { throw new Error('parentCategory is undefined'); }

  const nodes = new Array<INode>();
  if (parentCategory.subCategories && parentCategory.subCategories.length > 0) {
    for (const subCategory of parentCategory.subCategories) {
      const subCategoryNodes = parseCategoryRecursively(subCategory);
      nodes.push(convertCategoryToNode(subCategory, subCategoryNodes));
    }
  }
  if (parentCategory.scripts && parentCategory.scripts.length > 0) {
    for (const script of parentCategory.scripts) {
      nodes.push(convertScriptToNode(script));
    }
  }
  return nodes;
}

function convertCategoryToNode(
  category: ICategory, children: readonly INode[]): INode {
  return {
    id: getCategoryNodeId(category),
    text: category.name,
    children,
    documentationUrls: category.documentationUrls,
    isReversible: false,
  };
}

function convertScriptToNode(script: IScript): INode {
  return {
    id: getScriptNodeId(script),
    text: script.name,
    children: undefined,
    documentationUrls: script.documentationUrls,
    isReversible: script.canRevert(),
  };
}
