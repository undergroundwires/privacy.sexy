<template>
    <span>
        <span v-if="initialLiquourTreeNodes != null && initialLiquourTreeNodes.length > 0">
            <tree :options="liquorTreeOptions"
                  :data="initialLiquourTreeNodes"
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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import LiquorTree from 'liquor-tree';
import Node from './Node/Node.vue';
import { INode } from './Node/INode';
import { convertExistingToNode, toNewLiquorTreeNode } from './LiquorTree/NodeWrapper/NodeTranslator';
import { INodeSelectedEvent } from './/INodeSelectedEvent';
import { getNewState } from './LiquorTree/NodeWrapper/NodeStateUpdater';
import { LiquorTreeOptions } from './LiquorTree/LiquorTreeOptions';
import { FilterPredicate, NodePredicateFilter } from './LiquorTree/NodeWrapper/NodePredicateFilter';
import { ILiquorTreeNewNode, ILiquorTreeExistingNode, ILiquorTree, ILiquorTreeNode, ILiquorTreeNodeState } from 'liquor-tree';

/** Wrapper for Liquor Tree, reveals only abstracted INode for communication */
@Component({
    components: {
        LiquorTree,
        Node,
    },
})
export default class SelectableTree extends Vue { // Keep it stateless to make it easier to switch out
    @Prop() public filterPredicate?: FilterPredicate;
    @Prop() public filterText?: string;
    @Prop() public selectedNodeIds?: ReadonlyArray<string>;
    @Prop() public initialNodes?: ReadonlyArray<INode>;

    public initialLiquourTreeNodes?: ILiquorTreeNewNode[] = null;
    public liquorTreeOptions = new LiquorTreeOptions(new NodePredicateFilter((node) => this.filterPredicate(node)));
    public convertExistingToNode = convertExistingToNode;

    public nodeSelected(node: ILiquorTreeExistingNode) {
        const event: INodeSelectedEvent = {
            node: convertExistingToNode(node),
            isSelected: node.states.checked,
        };
        this.$emit('nodeSelected', event);
        return;
    }

    @Watch('initialNodes', { immediate: true })
    public async updateNodesAsync(nodes: readonly INode[]) {
        if (!nodes) {
            throw new Error('undefined initial nodes');
        }
        const initialNodes = nodes.map((node) => toNewLiquorTreeNode(node));
        if (this.selectedNodeIds) {
            recurseDown(initialNodes,
                (node) => node.state = updateState(node.state, node, this.selectedNodeIds));
        }
        this.initialLiquourTreeNodes = initialNodes;
        const api = await this.getLiquorTreeApiAsync();
        api.setModel(this.initialLiquourTreeNodes); // as liquor tree is not reactive to data after initialization
    }
    @Watch('filterText', { immediate: true })
    public async updateFilterTextAsync(filterText: |string) {
        const api = await this.getLiquorTreeApiAsync();
        if (!filterText) {
            api.clearFilter();
        } else {
            api.filter('filtered'); // text does not matter, it'll trigger the filterPredicate
        }
    }

    @Watch('selectedNodeIds')
    public async setSelectedStatusAsync(selectedNodeIds: ReadonlyArray<string>) {
        if (!selectedNodeIds) {
            throw new Error('SelectedrecurseDown nodes are undefined');
        }
        const tree = await this.getLiquorTreeApiAsync();
        tree.recurseDown(
            (node) => node.states = updateState(node.states, node, selectedNodeIds),
        );
    }

    private async getLiquorTreeApiAsync(): Promise<ILiquorTree> {
        const accessor = (): ILiquorTree => {
            const uiElement = this.$refs.treeElement;
            return uiElement ? (uiElement as any).tree : undefined;
        };
        const treeElement = await tryUntilDefinedAsync(accessor, 5, 20); // Wait for it to render
        if (!treeElement) {
            throw Error('Referenced tree element cannot be found. Perhaps it\'s not yet rendered?');
        }
        return treeElement;
    }
}

function updateState(
    old: ILiquorTreeNodeState,
    node: ILiquorTreeNode,
    selectedNodeIds: ReadonlyArray<string>): ILiquorTreeNodeState {
    return {...old, ...getNewState(node, selectedNodeIds)};
}
function recurseDown(
    nodes: ReadonlyArray<ILiquorTreeNewNode>,
    handler: (node: ILiquorTreeNewNode) => void) {
    for (const node of nodes) {
        handler(node);
        if (node.children) {
            recurseDown(node.children, handler);
        }
    }
}
async function tryUntilDefinedAsync<T>(
    accessor: () => T | undefined,
    delayInMs: number, maxTries: number): Promise<T | undefined> {
    const sleepAsync = () => new Promise(((resolve) => setTimeout(resolve, delayInMs)));
    let triesLeft = maxTries;
    let value: T;
    while (triesLeft !== 0) {
        value = accessor();
        if (value) {
            return value;
        }
        triesLeft--;
        await sleepAsync();
    }
    return value;
}
</script>
