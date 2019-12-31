import { ICategory } from './../../../domain/ICategory';
import { IApplicationState, IUserSelection } from '@/application/State/IApplicationState';
import { INode } from './../SelectableTree/INode';

export class ScriptNodeParser {
    public static parseNodes(categoryId: number, state: IApplicationState): INode[] | undefined {
        const category = state.getCategory(categoryId);
        if (!category) {
              throw new Error(`Category with id ${categoryId} does not exist`);
          }
        const tree = this.parseNodesRecursively(category, state.selection);
        return tree;
    }

    private static parseNodesRecursively(parentCategory: ICategory, selection: IUserSelection): INode[] {
          const nodes = new Array<INode>();
          if (parentCategory.subCategories && parentCategory.subCategories.length > 0) {
              for (const subCategory of parentCategory.subCategories) {
                  const subCategoryNodes = this.parseNodesRecursively(subCategory, selection);
                  nodes.push(
                    {
                      id: `cat${subCategory.id}`,
                      text: subCategory.name,
                      selected: false,
                      children: subCategoryNodes,
                      documentationUrls: subCategory.documentationUrls,
                    });
              }
          }
          if (parentCategory.scripts && parentCategory.scripts.length > 0) {
              for (const script of parentCategory.scripts) {
                  nodes.push( {
                    id: script.id,
                    text: script.name,
                    selected: selection.isSelected(script),
                    children: undefined,
                    documentationUrls: script.documentationUrls,
                });
              }
          }
          return nodes;
      }
}
