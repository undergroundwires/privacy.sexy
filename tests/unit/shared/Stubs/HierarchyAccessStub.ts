import type { HierarchyAccess } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/Hierarchy/HierarchyAccess';
import type { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';

export class HierarchyAccessStub implements HierarchyAccess {
  public parent: TreeNode | undefined = undefined;

  public children: readonly TreeNode[] = [];

  public depthInTree = 0;

  public isLeafNode = true;

  public isBranchNode = false;

  public setParent(parent: TreeNode): void {
    this.parent = parent;
  }

  public setChildren(children: readonly TreeNode[]): void {
    this.children = children;
  }

  public withParent(parent: TreeNode | undefined): this {
    this.parent = parent;
    return this;
  }

  public withDepthInTree(depthInTree: number): this {
    this.depthInTree = depthInTree;
    return this;
  }

  public withChildren(children: readonly TreeNode[]): this {
    this.setChildren(children);
    return this;
  }

  public withIsBranchNode(value: boolean): this {
    this.isBranchNode = value;
    return this;
  }

  public withIsLeafNode(value: boolean): this {
    this.isLeafNode = value;
    return this;
  }
}
