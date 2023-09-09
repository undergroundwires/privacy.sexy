import type { ReadOnlyTreeNode } from '../Node/TreeNode';

export interface TreeViewFilterEvent {
  readonly action: TreeViewFilterAction;
  /**
   * A simple numeric value to ensure uniqueness of each event.
   *
   * This property is used to guarantee that the watch function will trigger
   * even if the same filter action value is emitted consecutively.
   */
  readonly timestamp: Date;

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
    timestamp: new Date(),
    predicate,
  };
}

export function createFilterRemovedEvent(): TreeViewFilterEvent {
  return {
    action: TreeViewFilterAction.Removed,
    timestamp: new Date(),
  };
}
