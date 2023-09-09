<template>
  <span id="container">
    <span v-if="initialNodes.length">
      <TreeView
        :initialNodes="initialNodes"
        :selectedLeafNodeIds="selectedScriptNodeIds"
        :latestFilterEvent="latestFilterEvent"
        @nodeStateChanged="handleNodeChangedEvent($event)"
      >
        <template v-slot:node-content="{ nodeMetadata }">
          <NodeContent :nodeMetadata="nodeMetadata" />
        </template>
      </TreeView>
    </span>
    <span v-else>Nooo 😢</span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TreeView from './TreeView/TreeView.vue';
import NodeContent from './NodeContent/NodeContent.vue';
import { useTreeViewFilterEvent } from './TreeViewAdapter/UseTreeViewFilterEvent';
import { useTreeViewNodeInput } from './TreeViewAdapter/UseTreeViewNodeInput';
import { useCollectionSelectionStateUpdater } from './TreeViewAdapter/UseCollectionSelectionStateUpdater';
import { TreeNodeStateChangedEmittedEvent } from './TreeView/Bindings/TreeNodeStateChangedEmittedEvent';
import { useSelectedScriptNodeIds } from './TreeViewAdapter/UseSelectedScriptNodeIds';

export default defineComponent({
  props: {
    categoryId: {
      type: [Number, undefined],
      default: undefined,
    },
  },
  components: {
    TreeView,
    NodeContent,
  },
  setup(props) {
    const { selectedScriptNodeIds } = useSelectedScriptNodeIds();
    const { latestFilterEvent } = useTreeViewFilterEvent();
    const { treeViewInputNodes } = useTreeViewNodeInput(() => props.categoryId);
    const { updateNodeSelection } = useCollectionSelectionStateUpdater();

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
