import type { ReadOnlyTreeNode } from '../Node/TreeNode';

type TreeViewFilterTriggeredEvent = {
  readonly action: TreeViewFilterAction.Triggered;
  readonly predicate: TreeViewFilterPredicate;
};

type TreeViewFilterRemovedEvent = {
  readonly action: TreeViewFilterAction.Removed;
};

export type TreeViewFilterEvent = TreeViewFilterTriggeredEvent | TreeViewFilterRemovedEvent;

export enum TreeViewFilterAction {
  Triggered,
  Removed,
}

export type TreeViewFilterPredicate = (node: ReadOnlyTreeNode) => boolean;

export function createFilterTriggeredEvent(
  predicate: TreeViewFilterPredicate,
): TreeViewFilterTriggeredEvent {
  return {
    action: TreeViewFilterAction.Triggered,
    predicate,
  };
}

export function createFilterRemovedEvent(): TreeViewFilterRemovedEvent {
  return {
    action: TreeViewFilterAction.Removed,
  };
}
