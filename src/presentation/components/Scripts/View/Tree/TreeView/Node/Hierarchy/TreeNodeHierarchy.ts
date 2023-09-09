import { TreeNode } from '../TreeNode';
import { HierarchyAccess } from './HierarchyAccess';

export class TreeNodeHierarchy implements HierarchyAccess {
  public parent: TreeNode | undefined = undefined;

  public get depthInTree(): number {
    if (!this.parent) {
      return 0;
    }
    return this.parent.hierarchy.depthInTree + 1;
  }

  public get isLeafNode(): boolean {
    return this.children.length === 0;
  }

  public get isBranchNode(): boolean {
    return this.children.length > 0;
  }

  public children: readonly TreeNode[];

  public setChildren(children: readonly TreeNode[]): void {
    this.children = children;
  }

  public setParent(parent: TreeNode): void {
    this.parent = parent;
  }
}
