import type { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import type { SingleNodeFocusManager } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/Focus/SingleNodeFocusManager';
import { TreeNodeStub } from './TreeNodeStub';

export class SingleNodeFocusManagerStub implements SingleNodeFocusManager {
  public currentSingleFocusedNode: TreeNode = new TreeNodeStub()
    .withId(`[${SingleNodeFocusManagerStub.name}] focused-node-stub`);

  setSingleFocus(): void { /* NOOP */ }
}
