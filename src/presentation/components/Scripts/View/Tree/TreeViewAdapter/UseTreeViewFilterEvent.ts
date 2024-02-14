import {
  Ref, shallowReadonly, shallowRef,
} from 'vue';
import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';
import { injectKey } from '@/presentation/injectionSymbols';
import { ReadonlyFilterContext } from '@/application/Context/State/Filter/FilterContext';
import { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import { TreeViewFilterEvent, createFilterRemovedEvent, createFilterTriggeredEvent } from '../TreeView/Bindings/TreeInputFilterEvent';
import { NodeMetadata } from '../NodeContent/NodeMetadata';
import { ReadOnlyTreeNode } from '../TreeView/Node/TreeNode';
import { getNodeMetadata } from './TreeNodeMetadataConverter';
import { getCategoryNodeId, getScriptNodeId } from './CategoryNodeMetadataConverter';

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

function containsScript(expected: NodeMetadata, scripts: readonly IScript[]) {
  return scripts.some((existing: IScript) => expected.id === getScriptNodeId(existing));
}

function containsCategory(expected: NodeMetadata, categories: readonly ICategory[]) {
  return categories.some((existing: ICategory) => expected.id === getCategoryNodeId(existing));
}
