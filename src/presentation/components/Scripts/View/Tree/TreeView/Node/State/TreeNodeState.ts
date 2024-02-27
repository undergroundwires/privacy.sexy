import { EventSource } from '@/infrastructure/Events/EventSource';
import { TreeNodeStateTransactionDescriber } from './TreeNodeStateTransactionDescriber';
import { TreeNodeCheckState } from './CheckState';
import type { NodeStateChangedEvent, TreeNodeStateAccess, TreeNodeStateTransaction } from './StateAccess';
import type { TreeNodeStateDescriptor } from './StateDescriptor';

export class TreeNodeState implements TreeNodeStateAccess {
  public current: TreeNodeStateDescriptor = {
    checkState: TreeNodeCheckState.Unchecked,
    isExpanded: false,
    isVisible: true,
    isMatched: false,
    isFocused: false,
  };

  public readonly changed = new EventSource<NodeStateChangedEvent>();

  public beginTransaction(): TreeNodeStateTransaction {
    return new TreeNodeStateTransactionDescriber();
  }

  public commitTransaction(transaction: TreeNodeStateTransaction): void {
    const oldState = this.current;
    const newState: TreeNodeStateDescriptor = {
      ...this.current,
      ...transaction.updatedState,
    };
    if (areEqual(oldState, newState)) {
      return;
    }
    this.current = newState;
    const event: NodeStateChangedEvent = {
      oldState,
      newState,
    };
    this.changed.notify(event);
  }

  public toggleCheck(): void {
    const checkStateTransitions: {
      readonly [K in TreeNodeCheckState]: TreeNodeCheckState;
    } = {
      [TreeNodeCheckState.Checked]: TreeNodeCheckState.Unchecked,
      [TreeNodeCheckState.Unchecked]: TreeNodeCheckState.Checked,
      [TreeNodeCheckState.Indeterminate]: TreeNodeCheckState.Unchecked,
    };

    this.commitTransaction(
      this.beginTransaction().withCheckState(checkStateTransitions[this.current.checkState]),
    );
  }

  public toggleExpand(): void {
    this.commitTransaction(
      this.beginTransaction().withExpansionState(!this.current.isExpanded),
    );
  }
}

function areEqual(first: TreeNodeStateDescriptor, second: TreeNodeStateDescriptor): boolean {
  return first.isFocused === second.isFocused
    && first.isMatched === second.isMatched
    && first.isVisible === second.isVisible
    && first.isExpanded === second.isExpanded
    && first.checkState === second.checkState;
}
