import { TreeNodeStateDescriptor } from '../Node/State/StateDescriptor';
import { ReadOnlyTreeNode } from '../Node/TreeNode';

export interface TreeNodeStateChangedEmittedEvent {
  readonly node: ReadOnlyTreeNode;
  readonly oldState?: TreeNodeStateDescriptor;
  readonly newState: TreeNodeStateDescriptor;
}
