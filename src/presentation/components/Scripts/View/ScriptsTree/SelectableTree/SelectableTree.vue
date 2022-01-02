<template>
  <span>
    <span v-if="initialLiquorTreeNodes != null && initialLiquorTreeNodes.length > 0">
      <tree :options="liquorTreeOptions"
        :data="initialLiquorTreeNodes"
        v-on:node:checked="nodeSelected($event)"
        v-on:node:unchecked="nodeSelected($event)"
        ref="treeElement"
      >
        <span class="tree-text" slot-scope="{ node }" >
          <Node :data="convertExistingToNode(node)" />
        </span>
      </tree>
    </span>
    <span v-else>Nooo 😢</span>
  </span>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import LiquorTree, {
  ILiquorTreeNewNode, ILiquorTreeExistingNode, ILiquorTree, ILiquorTreeNode, ILiquorTreeNodeState,
} from 'liquor-tree';
import { sleep } from '@/infrastructure/Threading/AsyncSleep';
import Node from './Node/Node.vue';
import { INode } from './Node/INode';
import { convertExistingToNode, toNewLiquorTreeNode } from './LiquorTree/NodeWrapper/NodeTranslator';
import { INodeSelectedEvent } from './INodeSelectedEvent';
import { getNewState } from './LiquorTree/NodeWrapper/NodeStateUpdater';
import { LiquorTreeOptions } from './LiquorTree/LiquorTreeOptions';
import { FilterPredicate, NodePredicateFilter } from './LiquorTree/NodeWrapper/NodePredicateFilter';

/** Wrapper for Liquor Tree, reveals only abstracted INode for communication */
@Component({
  components: {
    LiquorTree,
    Node,
  },
})
export default class SelectableTree extends Vue { // Stateless to make it easier to switch out
  @Prop() public filterPredicate?: FilterPredicate;

  @Prop() public filterText?: string;

  @Prop() public selectedNodeIds?: ReadonlyArray<string>;

  @Prop() public initialNodes?: ReadonlyArray<INode>;

  public initialLiquorTreeNodes?: ILiquorTreeNewNode[] = null;

  public liquorTreeOptions = new LiquorTreeOptions(
    new NodePredicateFilter((node) => this.filterPredicate(node)),
  );

  public convertExistingToNode = convertExistingToNode;

  public nodeSelected(node: ILiquorTreeExistingNode) {
    const event: INodeSelectedEvent = {
      node: convertExistingToNode(node),
      isSelected: node.states.checked,
    };
    this.$emit('nodeSelected', event);
  }

  @Watch('initialNodes', { immediate: true })
  public async updateNodes(nodes: readonly INode[]) {
    if (!nodes) {
      throw new Error('undefined initial nodes');
    }
    const initialNodes = nodes.map((node) => toNewLiquorTreeNode(node));
    if (this.selectedNodeIds) {
      recurseDown(
        initialNodes,
        (node) => {
          node.state = updateState(node.state, node, this.selectedNodeIds);
        },
      );
    }
    this.initialLiquorTreeNodes = initialNodes;
    const api = await this.getLiquorTreeApi();
    // We need to set the model manually on each update because liquor tree is not reactive to data
    // changes after its initialization.
    api.setModel(this.initialLiquorTreeNodes);
  }

  @Watch('filterText', { immediate: true })
  public async updateFilterText(filterText: |string) {
    const api = await this.getLiquorTreeApi();
    if (!filterText) {
      api.clearFilter();
    } else {
      api.filter('filtered'); // text does not matter, it'll trigger the filterPredicate
    }
  }

  @Watch('selectedNodeIds')
  public async setSelectedStatus(selectedNodeIds: ReadonlyArray<string>) {
    if (!selectedNodeIds) {
      throw new Error('Selected recurseDown nodes are undefined');
    }
    const tree = await this.getLiquorTreeApi();
    tree.recurseDown(
      (node) => {
        node.states = updateState(node.states, node, selectedNodeIds);
      },
    );
  }

  private async getLiquorTreeApi(): Promise<ILiquorTree> {
    const accessor = (): ILiquorTree => {
      const uiElement = this.$refs.treeElement;
      type TreeElement = typeof uiElement & {tree: ILiquorTree};
      return uiElement ? (uiElement as TreeElement).tree : undefined;
    };
    const treeElement = await tryUntilDefined(accessor, 5, 20); // Wait for it to render
    if (!treeElement) {
      throw Error('Referenced tree element cannot be found. Perhaps it\'s not yet rendered?');
    }
    return treeElement;
  }
}

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
