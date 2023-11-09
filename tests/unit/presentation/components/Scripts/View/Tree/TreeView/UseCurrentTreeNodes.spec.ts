import { describe, it, expect } from 'vitest';
import {
  shallowRef, defineComponent, WatchSource, nextTick,
} from 'vue';
import { shallowMount } from '@vue/test-utils';
import { TreeRoot } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRoot';
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
    const treeWatcher = shallowRef<TreeRoot>(new TreeRootStub().withCollection(
      new TreeNodeCollectionStub().withNodes(expectedNodes),
    ));
    // act
    const { returnObject } = mountWrapperComponent(treeWatcher);
    // assert
    expect(returnObject.nodes.value).to.deep.equal(expectedNodes);
  });

  it('should update nodes when treeWatcher changes', async () => {
    // arrange
    const initialNodes = new QueryableNodesStub();
    const treeWatcher = shallowRef(
      new TreeRootStub().withCollection(new TreeNodeCollectionStub().withNodes(initialNodes)),
    );
    const { returnObject } = mountWrapperComponent(treeWatcher);
    const newExpectedNodes = new QueryableNodesStub();
    // act
    treeWatcher.value = new TreeRootStub().withCollection(
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
    const treeWatcher = shallowRef(new TreeRootStub().withCollection(treeCollectionStub));

    const { returnObject } = mountWrapperComponent(treeWatcher);

    const newExpectedNodes = new QueryableNodesStub();
    // act
    treeCollectionStub.triggerNodesUpdatedEvent(newExpectedNodes);
    await nextTick();
    // assert
    expect(returnObject.nodes.value).to.deep.equal(newExpectedNodes);
  });
});

function mountWrapperComponent(treeWatcher: WatchSource<TreeRoot | undefined>) {
  let returnObject: ReturnType<typeof useCurrentTreeNodes>;
  const wrapper = shallowMount(
    defineComponent({
      setup() {
        returnObject = useCurrentTreeNodes(treeWatcher);
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
