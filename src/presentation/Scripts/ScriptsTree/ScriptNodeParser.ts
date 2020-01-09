import { IApplicationState, IUserSelection } from '@/application/State/IApplicationState';
import { ICategory, IScript } from '@/domain/ICategory';
import { INode } from './SelectableTree/INode';

export function parseAllCategories(state: IApplicationState): INode[] | undefined {
  const nodes = new Array<INode>();
  for (const category of state.app.categories) {
    const children = parseCategoryRecursively(category, state.selection);
    nodes.push(convertCategoryToNode(category, children));
  }
  return nodes;
}

export function parseSingleCategory(categoryId: number, state: IApplicationState): INode[] | undefined {
  const category = state.app.findCategory(categoryId);
  if (!category) {
    throw new Error(`Category with id ${categoryId} does not exist`);
  }
  const tree = parseCategoryRecursively(category, state.selection);
  return tree;
}

function parseCategoryRecursively(
  parentCategory: ICategory,
  selection: IUserSelection): INode[] {
  if (!parentCategory) { throw new Error('parentCategory is undefined'); }
  if (!selection) { throw new Error('selection is undefined'); }

  const nodes = new Array<INode>();
  if (parentCategory.subCategories && parentCategory.subCategories.length > 0) {
    for (const subCategory of parentCategory.subCategories) {
      const subCategoryNodes = parseCategoryRecursively(subCategory, selection);
      nodes.push(convertCategoryToNode(subCategory, subCategoryNodes));
    }
  }
  if (parentCategory.scripts && parentCategory.scripts.length > 0) {
    for (const script of parentCategory.scripts) {
      nodes.push(convertScriptToNode(script, selection));
    }
  }
  return nodes;
}

function convertCategoryToNode(
  category: ICategory, children: readonly INode[]): INode {
  return {
    id: `${category.id}`,
    text: category.name,
    selected: false,
    children,
    documentationUrls: category.documentationUrls,
  };
}

function convertScriptToNode(script: IScript, selection: IUserSelection): INode {
  return {
    id: `${script.id}`,
    text: script.name,
    selected: selection.isSelected(script),
    children: undefined,
    documentationUrls: script.documentationUrls,
  };
}
