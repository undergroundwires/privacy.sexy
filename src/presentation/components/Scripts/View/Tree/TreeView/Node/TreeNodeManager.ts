import { TreeNode } from './TreeNode';
import { TreeNodeStateAccess } from './State/StateAccess';
import { TreeNodeState } from './State/TreeNodeState';
import { HierarchyAccess } from './Hierarchy/HierarchyAccess';
import { TreeNodeHierarchy } from './Hierarchy/TreeNodeHierarchy';

export class TreeNodeManager implements TreeNode {
  public readonly state: TreeNodeStateAccess;

  public readonly hierarchy: HierarchyAccess;

  constructor(public readonly id: string, public readonly metadata?: object) {
    if (!id) {
      throw new Error('missing id');
    }

    this.hierarchy = new TreeNodeHierarchy();

    this.state = new TreeNodeState();
  }
}
