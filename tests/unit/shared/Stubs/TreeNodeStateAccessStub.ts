import { NodeStateChangedEvent, TreeNodeStateAccess, TreeNodeStateTransaction } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateAccess';
import { TreeNodeStateDescriptor } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateDescriptor';
import { TreeNodeCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/CheckState';
import { TreeNodeStateDescriptorStub } from './TreeNodeStateDescriptorStub';
import { EventSourceStub } from './EventSourceStub';
import { TreeNodeStateTransactionStub } from './TreeNodeStateTransactionStub';

export class TreeNodeStateAccessStub implements TreeNodeStateAccess {
  public isStateModificationRequested = false;

  public current: TreeNodeStateDescriptor = new TreeNodeStateDescriptorStub();

  public changed: EventSourceStub<NodeStateChangedEvent> = new EventSourceStub();

  public toggleCheck(): void {
    throw new Error('Method not implemented.');
  }

  public toggleExpand(): void {
    throw new Error('Method not implemented.');
  }

  public beginTransaction(): TreeNodeStateTransaction {
    return new TreeNodeStateTransactionStub();
  }

  public commitTransaction(transaction: TreeNodeStateTransaction): void {
    const oldState = this.current;
    const newState = {
      ...oldState,
      ...transaction.updatedState,
    };
    this.current = newState;
    this.changed.notify({
      oldState,
      newState,
    });
    this.isStateModificationRequested = true;
  }

  public triggerStateChangedEvent(event: NodeStateChangedEvent) {
    this.changed.notify(event);
  }

  public withCurrent(state: TreeNodeStateDescriptor): this {
    this.current = state;
    return this;
  }

  public withCurrentCheckState(checkState: TreeNodeCheckState): this {
    return this.withCurrent(
      new TreeNodeStateDescriptorStub()
        .withCheckState(checkState),
    );
  }

  public withCurrentVisibility(isVisible: boolean): this {
    return this.withCurrent(
      new TreeNodeStateDescriptorStub()
        .withVisibility(isVisible),
    );
  }
}

export function createAccessStubsFromCheckStates(
  states: readonly TreeNodeCheckState[],
): TreeNodeStateAccessStub[] {
  return states.map(
    (checkState) => new TreeNodeStateAccessStub().withCurrentCheckState(checkState),
  );
}
