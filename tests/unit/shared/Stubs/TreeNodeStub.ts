import { HierarchyAccess } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/Hierarchy/HierarchyAccess';
import { TreeNodeStateAccess } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateAccess';
import { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { NodeMetadataStub } from './NodeMetadataStub';
import { HierarchyAccessStub } from './HierarchyAccessStub';

export class TreeNodeStub implements TreeNode {
  public state: TreeNodeStateAccess;

  public hierarchy: HierarchyAccess = new HierarchyAccessStub();

  public id: string;

  public metadata?: object = new NodeMetadataStub();

  public withMetadata(metadata: object): this {
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

  public withId(id: string): this {
    this.id = id;
    return this;
  }
}
