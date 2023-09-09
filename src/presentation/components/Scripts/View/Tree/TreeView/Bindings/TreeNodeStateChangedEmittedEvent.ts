import { NodeStateChangedEvent } from '../Node/State/StateAccess';
import { ReadOnlyTreeNode } from '../Node/TreeNode';

export interface TreeNodeStateChangedEmittedEvent {
  readonly change: NodeStateChangedEvent;
  readonly node: ReadOnlyTreeNode;
}
