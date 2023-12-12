<template>
  <div
    class="scripts-tree-container"
    :class="{
      'top-padding': hasTopPadding,
    }"
  >
    <template v-if="initialNodes.length">
      <TreeView
        :initial-nodes="initialNodes"
        :selected-leaf-node-ids="selectedScriptNodeIds"
        :latest-filter-event="latestFilterEvent"
        @node-state-changed="handleNodeChangedEvent($event)"
      >
        <template #node-content="{ nodeMetadata }">
          <NodeContent :node-metadata="nodeMetadata" />
        </template>
      </TreeView>
    </template>
    <template v-else>
      Nooo 😢
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRef } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import TreeView from './TreeView/TreeView.vue';
import NodeContent from './NodeContent/NodeContent.vue';
import { useTreeViewFilterEvent } from './TreeViewAdapter/UseTreeViewFilterEvent';
import { useTreeViewNodeInput } from './TreeViewAdapter/UseTreeViewNodeInput';
import { useCollectionSelectionStateUpdater } from './TreeViewAdapter/UseCollectionSelectionStateUpdater';
import { TreeNodeStateChangedEmittedEvent } from './TreeView/Bindings/TreeNodeStateChangedEmittedEvent';
import { useSelectedScriptNodeIds } from './TreeViewAdapter/UseSelectedScriptNodeIds';

export default defineComponent({
  components: {
    TreeView,
    NodeContent,
  },
  props: {
    categoryId: {
      type: [Number],
      default: undefined,
    },
    hasTopPadding: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const useUserCollectionStateHook = injectKey((keys) => keys.useUserSelectionState);
    const { selectedScriptNodeIds } = useSelectedScriptNodeIds(useUserCollectionStateHook);
    const { latestFilterEvent } = useTreeViewFilterEvent();
    const { treeViewInputNodes } = useTreeViewNodeInput(toRef(props, 'categoryId'));
    const { updateNodeSelection } = useCollectionSelectionStateUpdater(useUserCollectionStateHook);

    function handleNodeChangedEvent(event: TreeNodeStateChangedEmittedEvent) {
      updateNodeSelection(event);
    }

    return {
      initialNodes: treeViewInputNodes,
      selectedScriptNodeIds,
      latestFilterEvent,
      handleNodeChangedEvent,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

$padding: 20px;

.scripts-tree-container {
  display: flex; // We could provide `block`, but `flex` is more versatile.

  /* Set background color in consistent way so it has similar look when searching, on tree view, in cards etc. */
  background: $color-scripts-bg;

  padding-bottom: $padding;
  padding-left: $padding;
  padding-right: $padding;
  &.top-padding {
    padding-top: $padding;
  }
}
</style>
