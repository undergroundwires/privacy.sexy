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
    import LiquorTree, { ILiquorTreeNewNode, ILiquorTreeExistingNode, ILiquorTree } from 'liquor-tree';
    import Node from './Node/Node.vue';
    import { INode } from './Node/INode';
    import { convertExistingToNode, toNewLiquorTreeNode } from './LiquorTree/NodeWrapper/NodeTranslator';
    import { INodeSelectedEvent } from './/INodeSelectedEvent';
    import { getNewCheckedState } from './LiquorTree/NodeWrapper/NodeStateUpdater';
    import { LiquorTreeOptions } from './LiquorTree/LiquorTreeOptions';
    import { FilterPredicate, NodePredicateFilter } from './LiquorTree/NodeWrapper/NodePredicateFilter';

    /** Wrapper for Liquor Tree, reveals only abstracted INode for communication */
    @Component({
        components: {
            LiquorTree,
            Node,
        },
    })
    export default class SelectableTree extends Vue {
        @Prop() public filterPredicate?: FilterPredicate;
        @Prop() public filterText?: string;
        @Prop() public selectedNodeIds?: ReadonlyArray<string>;
        @Prop() public initialNodes?: ReadonlyArray<INode>;

        public initialLiquourTreeNodes?: ILiquorTreeNewNode[] = null;
        public liquorTreeOptions = new LiquorTreeOptions(new NodePredicateFilter((node) => this.filterPredicate(node)));
        public convertExistingToNode = convertExistingToNode;

        public mounted() {
            if (this.initialNodes) {
                const initialNodes = this.initialNodes.map((node) => toNewLiquorTreeNode(node));
                if (this.selectedNodeIds) {
                    recurseDown(initialNodes,
                        (node) => node.state.checked = getNewCheckedState(node, this.selectedNodeIds));
                }
                this.initialLiquourTreeNodes = initialNodes;
            } else {
                throw new Error('Initial nodes are null or empty');
            }
            if (this.filterText) {
               this.updateFilterText(this.filterText);
            }
        }

        public nodeSelected(node: ILiquorTreeExistingNode) {
            const event: INodeSelectedEvent = {
                node: convertExistingToNode(node),
                isSelected: node.states.checked,
            };
            this.$emit('nodeSelected', event);
            return;
        }

        @Watch('filterText')
        public updateFilterText(filterText: |string) {
            const api = this.getLiquorTreeApi();
            if (!filterText) {
                api.clearFilter();
            } else {
                api.filter('filtered'); // text does not matter, it'll trigger the filterPredicate
            }
        }

        @Watch('selectedNodeIds')
        public setSelectedStatusAsync(selectedNodeIds: ReadonlyArray<string>) {
            if (!selectedNodeIds) {
                throw new Error('Selected nodes are undefined');
            }
            this.getLiquorTreeApi().recurseDown((node) => {
                node.states.checked = getNewCheckedState(node, selectedNodeIds);
            });
        }

        private getLiquorTreeApi(): ILiquorTree {
            if (!this.$refs.treeElement) {
                throw new Error('Referenced tree element cannot be found. Probably it\'s not rendered?');
            }
            return (this.$refs.treeElement as any).tree;
        }
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
</script>
