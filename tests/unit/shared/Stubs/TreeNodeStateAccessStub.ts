import { NodeStateChangedEvent, TreeNodeStateAccess, TreeNodeStateTransaction } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateAccess';
import { TreeNodeStateDescriptor } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateDescriptor';
import { TreeNodeStateDescriptorStub } from './TreeNodeStateDescriptorStub';
import { EventSourceStub } from './EventSourceStub';
import { TreeNodeStateTransactionStub } from './TreeNodeStateTransactionStub';

export class TreeNodeStateAccessStub implements TreeNodeStateAccess {
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
  }

  public triggerStateChangedEvent(event: NodeStateChangedEvent) {
    this.changed.notify(event);
  }

  public withCurrent(state: TreeNodeStateDescriptor): this {
    this.current = state;
    return this;
  }
}
