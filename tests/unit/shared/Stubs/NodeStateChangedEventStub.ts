import type { NodeStateChangedEvent } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateAccess';
import type { TreeNodeStateDescriptor } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateDescriptor';
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
}
