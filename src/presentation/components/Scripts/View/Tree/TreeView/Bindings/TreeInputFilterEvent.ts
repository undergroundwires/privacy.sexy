import type { ReadOnlyTreeNode } from '../Node/TreeNode';

export interface TreeViewFilterEvent {
  readonly action: TreeViewFilterAction;
  readonly predicate?: TreeViewFilterPredicate;
}

export enum TreeViewFilterAction {
  Triggered,
  Removed,
}

export type TreeViewFilterPredicate = (node: ReadOnlyTreeNode) => boolean;

export function createFilterTriggeredEvent(
  predicate: TreeViewFilterPredicate,
): TreeViewFilterEvent {
  return {
    action: TreeViewFilterAction.Triggered,
    predicate,
  };
}

export function createFilterRemovedEvent(): TreeViewFilterEvent {
  return {
    action: TreeViewFilterAction.Removed,
  };
}
