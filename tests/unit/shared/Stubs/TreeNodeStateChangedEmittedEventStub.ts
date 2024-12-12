import type { TreeNodeStateChangedEmittedEvent } from '@/presentation/components/Scripts/View/Tree/TreeView/Bindings/TreeNodeStateChangedEmittedEvent';
import { TreeNodeCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/CheckState';
import type { TreeNodeStateDescriptor } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateDescriptor';
import type { ReadOnlyTreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { TreeNodeStateDescriptorStub } from './TreeNodeStateDescriptorStub';
import { TreeNodeStub } from './TreeNodeStub';

export class TreeNodeStateChangedEmittedEventStub implements TreeNodeStateChangedEmittedEvent {
  public node: ReadOnlyTreeNode = new TreeNodeStub();

  public oldState?: TreeNodeStateDescriptor = new TreeNodeStateDescriptorStub();

  public newState: TreeNodeStateDescriptor = new TreeNodeStateDescriptorStub();

  public withNode(node: ReadOnlyTreeNode): this {
    this.node = node;
    return this;
  }

  public withNewState(newState: TreeNodeStateDescriptor): this {
    this.newState = newState;
    return this;
  }

  public withOldState(oldState: TreeNodeStateDescriptor): this {
    this.oldState = oldState;
    return this;
  }

  public withCheckStateChange(change: {
    readonly oldState: TreeNodeCheckState,
    readonly newState: TreeNodeCheckState,
  }) {
    return this
      .withOldState(
        new TreeNodeStateDescriptorStub().withCheckState(change.oldState),
      )
      .withNewState(
        new TreeNodeStateDescriptorStub().withCheckState(change.newState),
      );
  }
}
