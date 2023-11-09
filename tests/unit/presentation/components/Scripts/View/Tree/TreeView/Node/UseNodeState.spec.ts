import { describe, it, expect } from 'vitest';
import {
  shallowRef, defineComponent, WatchSource, nextTick,
} from 'vue';
import { shallowMount } from '@vue/test-utils';
import { ReadOnlyTreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { useNodeState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/UseNodeState';
import { TreeNodeStateDescriptorStub } from '@tests/unit/shared/Stubs/TreeNodeStateDescriptorStub';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { TreeNodeStateAccessStub } from '@tests/unit/shared/Stubs/TreeNodeStateAccessStub';
import { NodeStateChangedEventStub } from '@tests/unit/shared/Stubs/NodeStateChangedEventStub';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { UseAutoUnsubscribedEventsStub } from '@tests/unit/shared/Stubs/UseAutoUnsubscribedEventsStub';

describe('useNodeState', () => {
  it('should set state on immediate invocation if node exists', () => {
    // arrange
    const expectedState = new TreeNodeStateDescriptorStub();
    const nodeWatcher = shallowRef<ReadOnlyTreeNode | undefined>(undefined);
    nodeWatcher.value = new TreeNodeStub()
      .withState(new TreeNodeStateAccessStub().withCurrent(expectedState));
    // act
    const { returnObject } = mountWrapperComponent(nodeWatcher);
    // assert
    expect(returnObject.state.value).to.equal(expectedState);
  });

  it('should not set state on immediate invocation if node is undefined', () => {
    // arrange
    const nodeWatcher = shallowRef<ReadOnlyTreeNode | undefined>(undefined);
    // act
    const { returnObject } = mountWrapperComponent(nodeWatcher);
    // assert
    expect(returnObject.state.value).toBeUndefined();
  });

  it('should update state when nodeWatcher changes', async () => {
    // arrange
    const expectedNewState = new TreeNodeStateDescriptorStub();
    const nodeWatcher = shallowRef<ReadOnlyTreeNode | undefined>(undefined);
    const { returnObject } = mountWrapperComponent(nodeWatcher);
    // act
    nodeWatcher.value = new TreeNodeStub()
      .withState(new TreeNodeStateAccessStub().withCurrent(expectedNewState));
    await nextTick();
    // assert
    expect(returnObject.state.value).to.equal(expectedNewState);
  });

  it('should update state when node state changes', () => {
    // arrange
    const nodeWatcher = shallowRef<ReadOnlyTreeNode | undefined>(undefined);
    const stateAccessStub = new TreeNodeStateAccessStub();
    const expectedChangedState = new TreeNodeStateDescriptorStub();
    nodeWatcher.value = new TreeNodeStub()
      .withState(stateAccessStub);

    // act
    const { returnObject } = mountWrapperComponent(nodeWatcher);
    stateAccessStub.triggerStateChangedEvent(
      new NodeStateChangedEventStub()
        .withNewState(expectedChangedState),
    );

    // assert
    expect(returnObject.state.value).to.equal(expectedChangedState);
  });
});

function mountWrapperComponent(nodeWatcher: WatchSource<ReadOnlyTreeNode | undefined>) {
  let returnObject: ReturnType<typeof useNodeState>;
  const wrapper = shallowMount(
    defineComponent({
      setup() {
        returnObject = useNodeState(nodeWatcher);
      },
      template: '<div></div>',
    }),
    {
      global: {
        provide: {
          [InjectionKeys.useAutoUnsubscribedEvents.key]:
            () => new UseAutoUnsubscribedEventsStub().get(),
        },
      },
    },
  );
  return {
    wrapper,
    returnObject,
  };
}
