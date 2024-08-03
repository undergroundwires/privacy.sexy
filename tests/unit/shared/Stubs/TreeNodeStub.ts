import type { HierarchyAccess } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/Hierarchy/HierarchyAccess';
import type { TreeNodeStateAccess } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateAccess';
import type { TreeNode, TreeNodeId } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { NodeMetadataStub } from './NodeMetadataStub';
import { HierarchyAccessStub } from './HierarchyAccessStub';
import { TreeNodeStateAccessStub } from './TreeNodeStateAccessStub';

export class TreeNodeStub implements TreeNode {
  public static fromStates(
    states: readonly TreeNodeStateAccess[],
  ): TreeNodeStub[] {
    return states.map(
      (state) => new TreeNodeStub()
        .withId(`[${TreeNodeStub.fromStates.name}] node-stub`)
        .withState(state),
    );
  }

  public state: TreeNodeStateAccess = new TreeNodeStateAccessStub();

  public hierarchy: HierarchyAccess = new HierarchyAccessStub();

  public id = 'tree-node-stub-id';

  public metadata?: object = new NodeMetadataStub();

  public withMetadata(metadata: object | undefined): this {
    this.metadata = metadata;
    return this;
  }

  public withHierarchy(hierarchy: HierarchyAccess): this {
    this.hierarchy = hierarchy;
    return this;
  }

  public withState(state: TreeNodeStateAccess): this {
    this.state = state;
    return this;
  }

  public withId(id: TreeNodeId): this {
    this.id = id;
    return this;
  }
}
