import { EventSource } from '@/infrastructure/Events/EventSource';
import { TreeInputNodeData } from '../../Bindings/TreeInputNodeData';
import { TreeNodeCollection } from './TreeNodeCollection';
import { parseTreeInput } from './TreeInputParser';
import { TreeNodeNavigator } from './Query/TreeNodeNavigator';
import { QueryableNodes } from './Query/QueryableNodes';

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
