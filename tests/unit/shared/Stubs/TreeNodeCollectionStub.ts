import type { QueryableNodes } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/Query/QueryableNodes';
import type { TreeNodeCollection } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/TreeNodeCollection';
import { EventSourceStub } from './EventSourceStub';
import { QueryableNodesStub } from './QueryableNodesStub';

export class TreeNodeCollectionStub implements TreeNodeCollection {
  public nodes: QueryableNodes = new QueryableNodesStub();

  public nodesUpdated = new EventSourceStub<QueryableNodes>();

  public updateRootNodes(): void {
    throw new Error('Method not implemented.');
  }

  public withNodes(nodes: QueryableNodes): this {
    this.nodes = nodes;
    return this;
  }

  public triggerNodesUpdatedEvent(nodes: QueryableNodes): this {
    this.nodesUpdated.notify(nodes);
    return this;
  }
}
