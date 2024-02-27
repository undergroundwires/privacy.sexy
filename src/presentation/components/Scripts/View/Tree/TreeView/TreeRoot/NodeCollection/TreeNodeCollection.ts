import type { IEventSource } from '@/infrastructure/Events/IEventSource';
import type { TreeInputNodeData } from '../../Bindings/TreeInputNodeData';
import type { QueryableNodes, ReadOnlyQueryableNodes } from './Query/QueryableNodes';

export interface ReadOnlyTreeNodeCollection {
  readonly nodes: ReadOnlyQueryableNodes;
  readonly nodesUpdated: IEventSource<ReadOnlyQueryableNodes>;
  updateRootNodes(rootNodes: readonly TreeInputNodeData[]): void;
}

export interface TreeNodeCollection extends ReadOnlyTreeNodeCollection {
  readonly nodes: QueryableNodes;
  readonly nodesUpdated: IEventSource<QueryableNodes>;
  updateRootNodes(rootNodes: readonly TreeInputNodeData[]): void;
}
