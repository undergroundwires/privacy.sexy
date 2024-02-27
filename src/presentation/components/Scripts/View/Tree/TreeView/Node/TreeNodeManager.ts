import { TreeNodeHierarchy } from './Hierarchy/TreeNodeHierarchy';
import { TreeNodeState } from './State/TreeNodeState';
import type { TreeNode } from './TreeNode';
import type { TreeNodeStateAccess } from './State/StateAccess';
import type { HierarchyAccess } from './Hierarchy/HierarchyAccess';

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
