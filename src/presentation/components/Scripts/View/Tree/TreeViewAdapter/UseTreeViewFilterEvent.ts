import {
  type Ref, shallowReadonly, shallowRef,
} from 'vue';
import type { Script } from '@/domain/Executables/Script/Script';
import type { Category } from '@/domain/Executables/Category/Category';
import { injectKey } from '@/presentation/injectionSymbols';
import type { ReadonlyFilterContext } from '@/application/Context/State/Filter/FilterContext';
import type { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import { type TreeViewFilterEvent, createFilterRemovedEvent, createFilterTriggeredEvent } from '../TreeView/Bindings/TreeInputFilterEvent';
import { getNodeMetadata } from './TreeNodeMetadataConverter';
import { getCategoryNodeId, getScriptNodeId } from './CategoryNodeMetadataConverter';
import type { NodeMetadata } from '../NodeContent/NodeMetadata';
import type { ReadOnlyTreeNode } from '../TreeView/Node/TreeNode';

type TreeNodeFilterResultPredicate = (
  node: ReadOnlyTreeNode,
  filterResult: FilterResult,
) => boolean;

export function useTreeViewFilterEvent() {
  const { onStateChange } = injectKey((keys) => keys.useCollectionState);
  const { events } = injectKey((keys) => keys.useAutoUnsubscribedEvents);

  const latestFilterEvent = shallowRef<TreeViewFilterEvent | undefined>(undefined);

  const treeNodePredicate: TreeNodeFilterResultPredicate = (node, filterResult) => filterMatches(
    getNodeMetadata(node),
    filterResult,
  );

  onStateChange((newState) => {
    latestFilterEvent.value = createFilterEvent(newState.filter.currentFilter, treeNodePredicate);
    events.unsubscribeAllAndRegister([
      subscribeToFilterChanges(newState.filter, latestFilterEvent, treeNodePredicate),
    ]);
  }, { immediate: true });

  return {
    latestFilterEvent: shallowReadonly(latestFilterEvent),
  };
}

function subscribeToFilterChanges(
  filter: ReadonlyFilterContext,
  latestFilterEvent: Ref<TreeViewFilterEvent | undefined>,
  filterPredicate: TreeNodeFilterResultPredicate,
) {
  return filter.filterChanged.on((event) => {
    event.visit({
      onApply: (result) => {
        latestFilterEvent.value = createFilterTriggeredEvent(
          (node) => filterPredicate(node, result),
        );
      },
      onClear: () => {
        latestFilterEvent.value = createFilterRemovedEvent();
      },
    });
  });
}

function createFilterEvent(
  filter: FilterResult | undefined,
  filterPredicate: TreeNodeFilterResultPredicate,
): TreeViewFilterEvent {
  if (!filter) {
    return createFilterRemovedEvent();
  }
  return createFilterTriggeredEvent(
    (node) => filterPredicate(node, filter),
  );
}

function filterMatches(node: NodeMetadata, filter: FilterResult): boolean {
  return containsScript(node, filter.scriptMatches)
    || containsCategory(node, filter.categoryMatches);
}

function containsScript(expected: NodeMetadata, scripts: readonly Script[]) {
  return scripts.some((existing: Script) => expected.id === getScriptNodeId(existing));
}

function containsCategory(expected: NodeMetadata, categories: readonly Category[]) {
  return categories.some((existing: Category) => expected.id === getCategoryNodeId(existing));
}
