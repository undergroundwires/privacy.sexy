import {
  Ref, inject, shallowReadonly, shallowRef,
} from 'vue';
import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { IReadOnlyUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { TreeViewFilterEvent, createFilterRemovedEvent, createFilterTriggeredEvent } from '../TreeView/Bindings/TreeInputFilterEvent';
import { NodeMetadata } from '../NodeContent/NodeMetadata';
import { ReadOnlyTreeNode } from '../TreeView/Node/TreeNode';
import { getNodeMetadata } from './TreeNodeMetadataConverter';
import { getCategoryNodeId, getScriptNodeId } from './CategoryNodeMetadataConverter';

type TreeNodeFilterResultPredicate = (
  node: ReadOnlyTreeNode,
  filterResult: IFilterResult,
) => boolean;

export function useTreeViewFilterEvent() {
  const { onStateChange } = inject(InjectionKeys.useCollectionState)();
  const { events } = inject(InjectionKeys.useAutoUnsubscribedEvents)();

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
  filter: IReadOnlyUserFilter,
  latestFilterEvent: Ref<TreeViewFilterEvent>,
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
  filter: IFilterResult | undefined,
  filterPredicate: TreeNodeFilterResultPredicate,
): TreeViewFilterEvent {
  if (!filter) {
    return createFilterRemovedEvent();
  }
  return createFilterTriggeredEvent(
    (node) => filterPredicate(node, filter),
  );
}

function filterMatches(node: NodeMetadata, filter: IFilterResult): boolean {
  return containsScript(node, filter.scriptMatches)
    || containsCategory(node, filter.categoryMatches);
}

function containsScript(expected: NodeMetadata, scripts: readonly IScript[]) {
  return scripts.some((existing: IScript) => expected.id === getScriptNodeId(existing));
}

function containsCategory(expected: NodeMetadata, categories: readonly ICategory[]) {
  return categories.some((existing: ICategory) => expected.id === getCategoryNodeId(existing));
}
