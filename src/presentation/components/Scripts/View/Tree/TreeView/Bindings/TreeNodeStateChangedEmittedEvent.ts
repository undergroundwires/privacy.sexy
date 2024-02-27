import type { TreeNodeStateDescriptor } from '../Node/State/StateDescriptor';
import type { ReadOnlyTreeNode } from '../Node/TreeNode';

export interface TreeNodeStateChangedEmittedEvent {
  readonly node: ReadOnlyTreeNode;
  readonly oldState?: TreeNodeStateDescriptor;
  readonly newState: TreeNodeStateDescriptor;
}
