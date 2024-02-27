import { describe, it, expect } from 'vitest';
import {
  shallowRef, defineComponent, nextTick, type Ref,
} from 'vue';
import { shallowMount } from '@vue/test-utils';
import type { ReadOnlyTreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
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
    const nodeRef = shallowRef<ReadOnlyTreeNode>(
      new TreeNodeStub().withState(new TreeNodeStateAccessStub().withCurrent(expectedState)),
    );
    // act
    const { returnObject } = mountWrapperComponent(nodeRef);
    // assert
    expect(returnObject.state.value).to.equal(expectedState);
  });

  it('should update state when node changes', async () => {
    // arrange
    const expectedNewState = new TreeNodeStateDescriptorStub();
    const nodeRef = shallowRef<ReadOnlyTreeNode>(new TreeNodeStub());
    const { returnObject } = mountWrapperComponent(nodeRef);
    // act
    nodeRef.value = new TreeNodeStub()
      .withState(new TreeNodeStateAccessStub().withCurrent(expectedNewState));
    await nextTick();
    // assert
    expect(returnObject.state.value).to.equal(expectedNewState);
  });

  it('should update state when node state changes', () => {
    // arrange
    const stateAccessStub = new TreeNodeStateAccessStub();
    const nodeRef = shallowRef<ReadOnlyTreeNode>(
      new TreeNodeStub().withState(stateAccessStub),
    );
    const expectedChangedState = new TreeNodeStateDescriptorStub();
    // act
    const { returnObject } = mountWrapperComponent(nodeRef);
    stateAccessStub.triggerStateChangedEvent(
      new NodeStateChangedEventStub()
        .withNewState(expectedChangedState),
    );
    // assert
    expect(returnObject.state.value).to.equal(expectedChangedState);
  });
});

function mountWrapperComponent(nodeRef: Readonly<Ref<ReadOnlyTreeNode>>) {
  let returnObject: ReturnType<typeof useNodeState> | undefined;
  const wrapper = shallowMount(
    defineComponent({
      setup() {
        returnObject = useNodeState(nodeRef);
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
  if (!returnObject) {
    throw new Error('missing hook result');
  }
  return {
    wrapper,
    returnObject,
  };
}
