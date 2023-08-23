<template>
  <span>
    <span v-if="initialLiquorTreeNodes?.length > 0">
      <LiquorTree
        :options="liquorTreeOptions"
        :data="initialLiquorTreeNodes"
        @node:checked="nodeSelected($event)"
        @node:unchecked="nodeSelected($event)"
        ref="liquorTree"
      >
        <template v-slot:default="{ node }">
          <span class="tree-text">
            <NodeContent :data="convertExistingToNode(node)" />
          </span>
        </template>
      </LiquorTree>
    </span>
    <span v-else>Nooo 😢</span>
  </span>
</template>

<script lang="ts">
import {
  PropType, defineComponent, ref, watch,
} from 'vue';
import LiquorTree, {
  ILiquorTreeNewNode, ILiquorTreeExistingNode, ILiquorTree, ILiquorTreeNode, ILiquorTreeNodeState,
} from 'liquor-tree';
import { sleep } from '@/infrastructure/Threading/AsyncSleep';
import NodeContent from './Node/NodeContent.vue';
import { INodeContent } from './Node/INodeContent';
import { convertExistingToNode, toNewLiquorTreeNode } from './LiquorTree/NodeWrapper/NodeTranslator';
import { INodeSelectedEvent } from './INodeSelectedEvent';
import { getNewState } from './LiquorTree/NodeWrapper/NodeStateUpdater';
import { LiquorTreeOptions } from './LiquorTree/LiquorTreeOptions';
import { FilterPredicate, NodePredicateFilter } from './LiquorTree/NodeWrapper/NodePredicateFilter';

/**
 * Wrapper for Liquor Tree, reveals only abstracted INode for communication.
 * Stateless to make it easier to switch out Liquor Tree to another component.
*/
export default defineComponent({
  components: {
    LiquorTree,
    NodeContent,
  },
  props: {
    filterPredicate: {
      type: Function as PropType<FilterPredicate>,
      default: undefined,
    },
    filterText: {
      type: String,
      default: undefined,
    },
    selectedNodeIds: {
      type: Array as PropType<ReadonlyArray<string>>,
      default: undefined,
    },
    initialNodes: {
      type: Array as PropType<ReadonlyArray<INodeContent>>,
      default: undefined,
    },
  },
  setup(props, { emit }) {
    const liquorTree = ref< { tree: ILiquorTree }>();
    const initialLiquorTreeNodes = ref<ReadonlyArray<ILiquorTreeNewNode>>();
    const liquorTreeOptions = new LiquorTreeOptions(
      new NodePredicateFilter((node) => props.filterPredicate(node)),
    );

    function nodeSelected(node: ILiquorTreeExistingNode) {
      const event: INodeSelectedEvent = {
        node: convertExistingToNode(node),
        isSelected: node.states.checked,
      };
      emit('nodeSelected', event);
    }

    watch(
      () => props.initialNodes,
      (nodes) => setInitialNodes(nodes),
      { immediate: true },
    );

    watch(
      () => props.filterText,
      (filterText) => setFilterText(filterText),
      { immediate: true },
    );

    watch(
      () => props.selectedNodeIds,
      (selectedNodeIds) => setSelectedStatus(selectedNodeIds),
    );

    async function setInitialNodes(nodes: readonly INodeContent[]) {
      if (!nodes) {
        throw new Error('missing initial nodes');
      }
      const initialNodes = nodes.map((node) => toNewLiquorTreeNode(node));
      if (props.selectedNodeIds) {
        recurseDown(
          initialNodes,
          (node) => {
            node.state = updateState(node.state, node, props.selectedNodeIds);
          },
        );
      }
      initialLiquorTreeNodes.value = initialNodes;
      const api = await getLiquorTreeApi();
      api.setModel(initialLiquorTreeNodes.value);
    }

    async function setFilterText(filterText?: string) {
      const api = await getLiquorTreeApi();
      if (!filterText) {
        api.clearFilter();
      } else {
        api.filter('filtered'); // text does not matter, it'll trigger the filterPredicate
      }
    }

    async function setSelectedStatus(selectedNodeIds: ReadonlyArray<string>) {
      if (!selectedNodeIds) {
        throw new Error('Selected recurseDown nodes are undefined');
      }
      const tree = await getLiquorTreeApi();
      tree.recurseDown(
        (node) => {
          node.states = updateState(node.states, node, selectedNodeIds);
        },
      );
    }

    async function getLiquorTreeApi(): Promise<ILiquorTree> {
      const tree = await tryUntilDefined(
        () => liquorTree.value?.tree,
        5,
        20,
      );
      if (!tree) {
        throw Error('Referenced tree element cannot be found. Perhaps it\'s not yet rendered?');
      }
      return tree;
    }

    return {
      liquorTreeOptions,
      initialLiquorTreeNodes,
      convertExistingToNode,
      nodeSelected,
      liquorTree,
    };
  },
});

function updateState(
  old: ILiquorTreeNodeState,
  node: ILiquorTreeNode,
  selectedNodeIds: ReadonlyArray<string>,
): ILiquorTreeNodeState {
  return { ...old, ...getNewState(node, selectedNodeIds) };
}

function recurseDown(
  nodes: ReadonlyArray<ILiquorTreeNewNode>,
  handler: (node: ILiquorTreeNewNode) => void,
) {
  for (const node of nodes) {
    handler(node);
    if (node.children) {
      recurseDown(node.children, handler);
    }
  }
}

async function tryUntilDefined<T>(
  accessor: () => T | undefined,
  delayInMs: number,
  maxTries: number,
): Promise<T | undefined> {
  let triesLeft = maxTries;
  let value: T;
  while (triesLeft !== 0) {
    value = accessor();
    if (value) {
      return value;
    }
    triesLeft--;
    // eslint-disable-next-line no-await-in-loop
    await sleep(delayInMs);
  }
  return value;
}
</script>
