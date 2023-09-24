import { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { QueryableNodes } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/Query/QueryableNodes';
import { TreeNodeStub } from './TreeNodeStub';

export class QueryableNodesStub implements QueryableNodes {
  public rootNodes: readonly TreeNode[] = [
    new TreeNodeStub().withId(`[${QueryableNodesStub.name}] root-node-stub`),
  ];

  public flattenedNodes: readonly TreeNode[] = [
    new TreeNodeStub().withId(`[${QueryableNodesStub.name}] flattened-node-stub-1`),
    new TreeNodeStub().withId(`[${QueryableNodesStub.name}] flattened-node-stub-2`),
  ];

  public getNodeById(): TreeNode {
    throw new Error('Method not implemented.');
  }

  public withRootNodes(rootNodes: readonly TreeNode[]): this {
    this.rootNodes = rootNodes;
    return this;
  }

  public withFlattenedNodes(flattenedNodes: readonly TreeNode[]): this {
    this.flattenedNodes = flattenedNodes;
    return this;
  }
}
