import { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { QueryableNodes } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/Query/QueryableNodes';

export class QueryableNodesStub implements QueryableNodes {
  public rootNodes: readonly TreeNode[];

  public flattenedNodes: readonly TreeNode[];

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
