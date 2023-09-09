import { TreeNodeCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/CheckState';
import { NodeStateChangedEvent } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateAccess';
import { TreeNodeStateDescriptor } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateDescriptor';
import { TreeNodeStateDescriptorStub } from '@tests/unit/shared/Stubs/TreeNodeStateDescriptorStub';

export class NodeStateChangedEventStub implements NodeStateChangedEvent {
  public oldState: TreeNodeStateDescriptor = new TreeNodeStateDescriptorStub();

  public newState: TreeNodeStateDescriptor = new TreeNodeStateDescriptorStub();

  public withNewState(newState: TreeNodeStateDescriptor): this {
    this.newState = newState;
    return this;
  }

  public withOldState(oldState: TreeNodeStateDescriptor): this {
    this.oldState = oldState;
    return this;
  }

  public withCheckStateChange(change: {
    readonly oldState: TreeNodeCheckState,
    readonly newState: TreeNodeCheckState,
  }) {
    return this
      .withOldState(
        new TreeNodeStateDescriptorStub().withCheckState(change.oldState),
      )
      .withNewState(
        new TreeNodeStateDescriptorStub().withCheckState(change.newState),
      );
  }
}
