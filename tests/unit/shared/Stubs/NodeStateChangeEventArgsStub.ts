import type { NodeStateChangeEventArgs } from '@/presentation/components/Scripts/View/Tree/TreeView/UseNodeStateChangeAggregator';
import type { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import type { TreeNodeStateDescriptor } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateDescriptor';
import { TreeNodeStub } from './TreeNodeStub';
import { TreeNodeStateDescriptorStub } from './TreeNodeStateDescriptorStub';
import { HierarchyAccessStub } from './HierarchyAccessStub';

export class NodeStateChangeEventArgsStub implements NodeStateChangeEventArgs {
  public node: TreeNode = new TreeNodeStub()
    .withId(`[${NodeStateChangeEventArgsStub.name}] node-stub`);

  public newState: TreeNodeStateDescriptor = new TreeNodeStateDescriptorStub();

  public oldState?: TreeNodeStateDescriptor = new TreeNodeStateDescriptorStub();

  public withNode(node: TreeNode): this {
    this.node = node;
    return this;
  }

  public withNewState(newState: TreeNodeStateDescriptor): this {
    this.newState = newState;
    return this;
  }

  public withOldState(oldState: TreeNodeStateDescriptor | undefined): this {
    this.oldState = oldState;
    return this;
  }
}

export function createChangeEvent(scenario: {
  readonly oldState?: TreeNodeStateDescriptor;
  readonly newState: TreeNodeStateDescriptor;
  readonly hierarchyBuilder?: (hierarchy: HierarchyAccessStub) => HierarchyAccessStub;
}) {
  let nodeHierarchy = new HierarchyAccessStub();
  if (scenario.hierarchyBuilder) {
    nodeHierarchy = scenario.hierarchyBuilder(nodeHierarchy);
  }
  const changeEvent = new NodeStateChangeEventArgsStub()
    .withOldState(scenario.oldState)
    .withNewState(scenario.newState)
    .withNode(new TreeNodeStub()
      .withId(`[${createChangeEvent.name}] node-stub`)
      .withHierarchy(nodeHierarchy));
  return changeEvent;
}
