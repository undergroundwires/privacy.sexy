import { ILiquorTreeFilter, ILiquorTreeExistingNode } from 'liquor-tree';
import { INodeContent } from '../../Node/INodeContent';
import { convertExistingToNode } from './NodeTranslator';

export type FilterPredicate = (node: INodeContent) => boolean;

export class NodePredicateFilter implements ILiquorTreeFilter {
  public emptyText = ''; // Does not matter as a custom message is shown

  constructor(private readonly filterPredicate: FilterPredicate) {
    if (!filterPredicate) {
      throw new Error('filterPredicate is undefined');
    }
  }

  public matcher(query: string, node: ILiquorTreeExistingNode): boolean {
    return this.filterPredicate(convertExistingToNode(node));
  }
}
