import {
  type Ref, shallowReadonly, shallowRef,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import type { ReadonlyFilterContext } from '@/application/Context/State/Filter/FilterContext';
import type { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
import type { Executable } from '@/domain/Executables/Executable';
import { type TreeViewFilterEvent, createFilterRemovedEvent, createFilterTriggeredEvent } from '../TreeView/Bindings/TreeInputFilterEvent';
import { createExecutableIdFromNodeId } from './CategoryNodeMetadataConverter';
import type { ReadOnlyTreeNode, TreeNodeId } from '../TreeView/Node/TreeNode';

type TreeNodeFilterResultPredicate = (
  node: ReadOnlyTreeNode,
  filterResult: FilterResult,
) => boolean;

export function useTreeViewFilterEvent() {
  const { onStateChange } = injectKey((keys) => keys.useCollectionState);
  const { events } = injectKey((keys) => keys.useAutoUnsubscribedEvents);

  const latestFilterEvent = shallowRef<TreeViewFilterEvent | undefined>(undefined);

  const treeNodePredicate: TreeNodeFilterResultPredicate = (node, filterResult) => filterMatches(
    node.id,
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

function filterMatches(nodeId: TreeNodeId, filter: FilterResult): boolean {
  const executableId = createExecutableIdFromNodeId(nodeId);
  return containsExecutable(executableId, filter.scriptMatches)
    || containsExecutable(executableId, filter.categoryMatches);
}

function containsExecutable(
  expectedId: ExecutableId,
  executables: readonly Executable[],
): boolean {
  return executables.some(
    (existing) => existing.executableId === expectedId,
  );
}
