import { ILiquorTreeFilter, ILiquorTreeExistingNode } from 'liquor-tree';
import { INode } from '../../Node/INode';
import { convertExistingToNode } from './NodeTranslator';

export type FilterPredicate = (node: INode) => boolean;

export class NodePredicateFilter implements ILiquorTreeFilter {
  public emptyText = ''; // Does not matter as a custom mesage is shown

  constructor(private readonly filterPredicate: FilterPredicate) {
    if (!filterPredicate) {
      throw new Error('filterPredicate is undefined');
    }
  }

  public matcher(query: string, node: ILiquorTreeExistingNode): boolean {
    return this.filterPredicate(convertExistingToNode(node));
  }
}
