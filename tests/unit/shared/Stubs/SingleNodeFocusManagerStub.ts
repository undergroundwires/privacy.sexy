import { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { SingleNodeFocusManager } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/Focus/SingleNodeFocusManager';
import { TreeNodeStub } from './TreeNodeStub';

export class SingleNodeFocusManagerStub implements SingleNodeFocusManager {
  public currentSingleFocusedNode: TreeNode = new TreeNodeStub();

  setSingleFocus(): void { /* NOOP */ }
}
