import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { TreeNodeStateDescriptor } from './StateDescriptor';
import { TreeNodeCheckState } from './CheckState';

export interface NodeStateChangedEvent {
  readonly oldState: TreeNodeStateDescriptor;
  readonly newState: TreeNodeStateDescriptor;
}

export interface TreeNodeStateReader {
  readonly current: TreeNodeStateDescriptor;
  readonly changed: IEventSource<NodeStateChangedEvent>;
}

/*
   The transactional approach allows for batched state changes.
   Instead of firing a state change event for every single operation,
   multiple changes can be batched into a single transaction.
   This ensures that listeners to the state change event are
   only notified once per batch of changes, optimizing performance
   and reducing potential event handling overhead.
*/
export interface TreeNodeStateTransactor {
  beginTransaction(): TreeNodeStateTransaction;
  commitTransaction(transaction: TreeNodeStateTransaction): void;
}

export interface TreeNodeStateTransaction {
  withExpansionState(isExpanded: boolean): TreeNodeStateTransaction;
  withMatchState(isMatched: boolean): TreeNodeStateTransaction;
  withFocusState(isFocused: boolean): TreeNodeStateTransaction;
  withVisibilityState(isVisible: boolean): TreeNodeStateTransaction;
  withCheckState(checkState: TreeNodeCheckState): TreeNodeStateTransaction;
  readonly updatedState: Partial<TreeNodeStateDescriptor>;
}

export interface TreeNodeStateWriter extends TreeNodeStateTransactor {
  toggleCheck(): void;
  toggleExpand(): void;
}

export interface TreeNodeStateAccess
  extends TreeNodeStateReader, TreeNodeStateWriter { }
