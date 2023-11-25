<template>
  <div class="scripts-tree-container">
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
.scripts-tree-container {
  display: flex; // We could provide `block`, but `flex` is more versatile.
  overflow: auto; // Prevents horizontal expansion of inner content (e.g., when a code block is shown)
}
</style>
