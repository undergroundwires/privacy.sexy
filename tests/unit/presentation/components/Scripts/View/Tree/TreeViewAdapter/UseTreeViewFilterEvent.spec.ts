import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { Ref, nextTick, watch } from 'vue';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { UseAutoUnsubscribedEventsStub } from '@tests/unit/shared/Stubs/UseAutoUnsubscribedEventsStub';
import { useTreeViewFilterEvent } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/UseTreeViewFilterEvent';
import { FilterResultStub } from '@tests/unit/shared/Stubs/FilterResultStub';
import { TreeViewFilterAction, TreeViewFilterEvent } from '@/presentation/components/Scripts/View/Tree/TreeView/Bindings/TreeInputFilterEvent';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { HierarchyAccessStub } from '@tests/unit/shared/Stubs/HierarchyAccessStub';
import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';
import { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { UserFilterStub } from '@tests/unit/shared/Stubs/UserFilterStub';
import { FilterChangeDetailsStub } from '@tests/unit/shared/Stubs/FilterChangeDetailsStub';
import { IFilterChangeDetails } from '@/application/Context/State/Filter/Event/IFilterChangeDetails';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import { NodeMetadataStub } from '@tests/unit/shared/Stubs/NodeMetadataStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';

describe('UseTreeViewFilterEvent', () => {
  describe('initially', () => {
    testFilterEvents((_, filterResult) => {
      // arrange
      const useCollectionStateStub = new UseCollectionStateStub()
        .withFilterResult(filterResult);
      // act
      const { returnObject } = mountWrapperComponent({
        useStateStub: useCollectionStateStub,
      });
      // assert
      return Promise.resolve({
        event: returnObject.latestFilterEvent,
      });
    });
  });
  describe('on filter state changed', () => {
    describe('handles new event correctly', () => {
      testFilterEvents((filterChange) => {
        // arrange
        const newFilter = filterChange;
        const initialFilter = new FilterResultStub().withSomeMatches();
        const filterStub = new UserFilterStub()
          .withCurrentFilterResult(initialFilter);
        const stateStub = new UseCollectionStateStub()
          .withFilter(filterStub);
        const { returnObject } = mountWrapperComponent({ useStateStub: stateStub });
        // act
        filterStub.notifyFilterChange(newFilter);
        // assert
        return Promise.resolve({
          event: returnObject.latestFilterEvent,
        });
      });
    });
    describe('handles if event is fired multiple times with same object', () => {
      testFilterEvents(async (filterChange) => {
        // arrange
        const newFilter = filterChange;
        const initialFilter = new FilterResultStub().withSomeMatches();
        const filterStub = new UserFilterStub()
          .withCurrentFilterResult(initialFilter);
        const stateStub = new UseCollectionStateStub()
          .withFilter(filterStub);
        const { returnObject } = mountWrapperComponent({ useStateStub: stateStub });
        let totalFilterUpdates = 0;
        watch(returnObject.latestFilterEvent, () => {
          totalFilterUpdates++;
        });
        // act
        filterStub.notifyFilterChange(newFilter);
        await nextTick();
        filterStub.notifyFilterChange(newFilter);
        await nextTick();
        // assert
        expect(totalFilterUpdates).to.equal(2);
        return {
          event: returnObject.latestFilterEvent,
        };
      });
    });
  });
  describe('on collection state changed', () => {
    describe('sets initial filter from new collection state', () => {
      testFilterEvents((_, filterResult) => {
        // arrange
        const newCollection = new CategoryCollectionStateStub()
          .withFilter(new UserFilterStub().withCurrentFilterResult(filterResult));
        const initialCollection = new CategoryCollectionStateStub();
        const useCollectionStateStub = new UseCollectionStateStub()
          .withState(initialCollection);
        // act
        const { returnObject } = mountWrapperComponent({
          useStateStub: useCollectionStateStub,
        });
        useCollectionStateStub.triggerOnStateChange({
          newState: newCollection,
          immediateOnly: false,
        });
        // assert
        return Promise.resolve({
          event: returnObject.latestFilterEvent,
        });
      });
    });
    describe('updates filter from new collection state', () => {
      testFilterEvents((filterChange) => {
        // arrange
        const newFilter = filterChange;
        const initialFilter = new FilterResultStub().withSomeMatches();
        const filterStub = new UserFilterStub();
        const newCollection = new CategoryCollectionStateStub()
          .withFilter(filterStub.withCurrentFilterResult(initialFilter));
        const initialCollection = new CategoryCollectionStateStub();
        const useCollectionStateStub = new UseCollectionStateStub()
          .withState(initialCollection);
        // act
        const { returnObject } = mountWrapperComponent({
          useStateStub: useCollectionStateStub,
        });
        useCollectionStateStub.triggerOnStateChange({
          newState: newCollection,
          immediateOnly: false,
        });
        filterStub.notifyFilterChange(newFilter);
        // assert
        return Promise.resolve({
          event: returnObject.latestFilterEvent,
        });
      });
    });
  });
});

function mountWrapperComponent(options?: {
  readonly useStateStub?: UseCollectionStateStub,
}) {
  const useStateStub = options?.useStateStub ?? new UseCollectionStateStub();
  let returnObject: ReturnType<typeof useTreeViewFilterEvent> | undefined;

  shallowMount({
    setup() {
      returnObject = useTreeViewFilterEvent();
    },
    template: '<div></div>',
  }, {
    global: {
      provide: {
        [InjectionKeys.useCollectionState.key]:
          () => useStateStub.get(),
        [InjectionKeys.useAutoUnsubscribedEvents.key]:
          () => new UseAutoUnsubscribedEventsStub().get(),
      },
    },
  });

  if (!returnObject) {
    throw new Error('missing hook result');
  }

  return {
    returnObject,
    useStateStub,
  };
}

type FilterChangeTestScenario = (
  result: IFilterChangeDetails,
  filter: IFilterResult | undefined,
) => Promise<{
  readonly event: Ref<TreeViewFilterEvent | undefined>,
}>;

function testFilterEvents(
  act: FilterChangeTestScenario,
) {
  describe('handles cleared filter correctly', () => {
    itExpectedFilterRemovedEvent(act);
  });
  describe('handles applied filter correctly', () => {
    itExpectedFilterTriggeredEvent(act);
  });
}

function itExpectedFilterRemovedEvent(
  act: FilterChangeTestScenario,
) {
  it('given cleared filter', async () => {
    // arrange
    const newFilter = FilterChangeDetailsStub.forClear();
    // act
    const { event } = await act(newFilter, undefined);
    // assert
    expectExists(event.value);
    if (event.value.action !== TreeViewFilterAction.Removed) {
      throw new Error(`Unexpected action: ${TreeViewFilterAction[event.value.action]}.`);
    }
  });
}

function itExpectedFilterTriggeredEvent(
  act: FilterChangeTestScenario,
) {
  const testScenarios: ReadonlyArray<{
    readonly description: string;
    readonly scriptMatches: IScript[],
    readonly categoryMatches: ICategory[],
    readonly givenNode: TreeNode,
    readonly expectedPredicateResult: boolean;
  }> = [
    {
      description: 'returns true when category exists',
      scriptMatches: [],
      categoryMatches: [new CategoryStub(1)],
      givenNode: createNode({ id: '1', hasParent: false }),
      expectedPredicateResult: true,
    },
    {
      description: 'returns true when script exists',
      scriptMatches: [new ScriptStub('a')],
      categoryMatches: [],
      givenNode: createNode({ id: 'a', hasParent: true }),
      expectedPredicateResult: true,
    },
    {
      description: 'returns false when category is missing',
      scriptMatches: [new ScriptStub('b')],
      categoryMatches: [new CategoryStub(2)],
      givenNode: createNode({ id: '1', hasParent: false }),
      expectedPredicateResult: false,
    },
    {
      description: 'finds false when script is missing',
      scriptMatches: [new ScriptStub('b')],
      categoryMatches: [new CategoryStub(1)],
      givenNode: createNode({ id: 'a', hasParent: true }),
      expectedPredicateResult: false,
    },
  ];
  testScenarios.forEach(({
    description, scriptMatches, categoryMatches, givenNode, expectedPredicateResult,
  }) => {
    it(description, async () => {
      // arrange
      const filterResult = new FilterResultStub()
        .withScriptMatches(scriptMatches)
        .withCategoryMatches(categoryMatches);
      const filterChange = FilterChangeDetailsStub.forApply(filterResult);
      // act
      const { event } = await act(filterChange, filterResult);
      // assert
      expectExists(event.value);
      if (event.value.action !== TreeViewFilterAction.Triggered) {
        throw new Error(`Unexpected action: ${TreeViewFilterAction[event.value.action]}.`);
      }
      expect(event.value.predicate).toBeDefined();
      const actualPredicateResult = event.value.predicate(givenNode);
      expect(actualPredicateResult).to.equal(
        expectedPredicateResult,
        [
          '\n---',
          `Script matches (${scriptMatches.length}): [${scriptMatches.map((s) => s.id).join(', ')}]`,
          `Category matches (${categoryMatches.length}): [${categoryMatches.map((s) => s.id).join(', ')}]`,
          `Expected node: "${givenNode.id}"`,
          '---\n\n',
        ].join('\n'),
      );
    });
  });
}

function createNode(options: {
  readonly id: string;
  readonly hasParent: boolean;
}): TreeNode {
  return new TreeNodeStub()
    .withId(options.id)
    .withMetadata(new NodeMetadataStub().withId(options.id))
    .withHierarchy(options.hasParent
      ? new HierarchyAccessStub().withParent(new TreeNodeStub())
      : new HierarchyAccessStub());
}
