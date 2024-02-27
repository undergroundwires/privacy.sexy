import { EventSource } from '@/infrastructure/Events/EventSource';
import { TreeNodeNavigator } from './Query/TreeNodeNavigator';
import { parseTreeInput } from './TreeInputParser';
import type { TreeInputNodeData } from '../../Bindings/TreeInputNodeData';
import type { TreeNodeCollection } from './TreeNodeCollection';
import type { QueryableNodes } from './Query/QueryableNodes';

export class TreeNodeInitializerAndUpdater implements TreeNodeCollection {
  public nodes: QueryableNodes = new TreeNodeNavigator([]);

  public nodesUpdated = new EventSource<QueryableNodes>();

  public updateRootNodes(rootNodesData: readonly TreeInputNodeData[]): void {
    if (!rootNodesData.length) {
      throw new Error('missing data');
    }
    const rootNodes = this.treeNodeParser(rootNodesData);
    this.nodes = new TreeNodeNavigator(rootNodes);
    this.nodesUpdated.notify(this.nodes);
  }

  constructor(private readonly treeNodeParser = parseTreeInput) { }
}
