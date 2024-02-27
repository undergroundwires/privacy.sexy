import { describe, it, expect } from 'vitest';
import {
  shallowRef, defineComponent, nextTick, type Ref,
} from 'vue';
import { shallowMount } from '@vue/test-utils';
import type { TreeRoot } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRoot';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { UseAutoUnsubscribedEventsStub } from '@tests/unit/shared/Stubs/UseAutoUnsubscribedEventsStub';
import { QueryableNodesStub } from '@tests/unit/shared/Stubs/QueryableNodesStub';
import { TreeNodeCollectionStub } from '@tests/unit/shared/Stubs/TreeNodeCollectionStub';
import { TreeRootStub } from '@tests/unit/shared/Stubs/TreeRootStub';
import { useCurrentTreeNodes } from '@/presentation/components/Scripts/View/Tree/TreeView/UseCurrentTreeNodes';

describe('useCurrentTreeNodes', () => {
  it('should set nodes on immediate invocation', () => {
    // arrange
    const expectedNodes = new QueryableNodesStub();
    const treeRootRef = shallowRef(new TreeRootStub().withCollection(
      new TreeNodeCollectionStub().withNodes(expectedNodes),
    ));
    // act
    const { returnObject } = mountWrapperComponent(treeRootRef);
    // assert
    expect(returnObject.nodes.value).to.deep.equal(expectedNodes);
  });

  it('should update nodes when tree root changes', async () => {
    // arrange
    const initialNodes = new QueryableNodesStub();
    const treeRootRef = shallowRef(
      new TreeRootStub().withCollection(new TreeNodeCollectionStub().withNodes(initialNodes)),
    );
    const { returnObject } = mountWrapperComponent(treeRootRef);
    const newExpectedNodes = new QueryableNodesStub();
    // act
    treeRootRef.value = new TreeRootStub().withCollection(
      new TreeNodeCollectionStub().withNodes(newExpectedNodes),
    );
    await nextTick();
    // assert
    expect(returnObject.nodes.value).to.deep.equal(newExpectedNodes);
  });

  it('should update nodes when tree collection nodesUpdated event is triggered', async () => {
    // arrange
    const initialNodes = new QueryableNodesStub();
    const treeCollectionStub = new TreeNodeCollectionStub().withNodes(initialNodes);
    const treeRootRef = shallowRef(new TreeRootStub().withCollection(treeCollectionStub));

    const { returnObject } = mountWrapperComponent(treeRootRef);

    const newExpectedNodes = new QueryableNodesStub();
    // act
    treeCollectionStub.triggerNodesUpdatedEvent(newExpectedNodes);
    await nextTick();
    // assert
    expect(returnObject.nodes.value).to.deep.equal(newExpectedNodes);
  });
});

function mountWrapperComponent(treeRootRef: Ref<TreeRoot>) {
  let returnObject: ReturnType<typeof useCurrentTreeNodes> | undefined;
  const wrapper = shallowMount(
    defineComponent({
      setup() {
        returnObject = useCurrentTreeNodes(treeRootRef);
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
