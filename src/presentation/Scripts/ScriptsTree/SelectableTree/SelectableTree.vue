<template>
    <span>
        <span v-if="initialLiquourTreeNodes != null && initialLiquourTreeNodes.length > 0">
            <tree :options="liquorTreeOptions"
                  :data="initialLiquourTreeNodes"
                  v-on:node:checked="nodeSelected($event)"
                  v-on:node:unchecked="nodeSelected($event)"
                  ref="treeElement"
                >
                <span class="tree-text" slot-scope="{ node }">
                    <Node :data="convertExistingToNode(node)"/>
                </span>
            </tree>
        </span>
        <span v-else>Nooo 😢</span>
    </span>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator';
    import LiquorTree, { ILiquorTreeNewNode, ILiquorTreeExistingNode, ILiquorTree, ILiquorTreeOptions } from 'liquor-tree';
    import Node from './Node.vue';
    import { INode } from './INode';
    import { convertExistingToNode, toNewLiquorTreeNode } from './NodeTranslator';
    export type FilterPredicate = (node: INode) => boolean;

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
        public liquorTreeOptions = this.getDefaults();
        public convertExistingToNode = convertExistingToNode;

        public mounted() {
            if (this.initialNodes) {
                const initialNodes = this.initialNodes.map((node) => toNewLiquorTreeNode(node));
                if (this.selectedNodeIds) {
                    recurseDown(initialNodes,
                        (node) => node.state.checked = this.selectedNodeIds.includes(node.id));
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
            this.$emit('nodeSelected', convertExistingToNode(node));
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
        public setSelectedStatus(selectedNodeIds: ReadonlyArray<string>) {
            if (!selectedNodeIds) {
                throw new Error('Selected nodes are undefined');
            }
            const newNodes = updateCheckedState(this.getLiquorTreeApi().model, selectedNodeIds);
            this.getLiquorTreeApi().setModel(newNodes);
            /*  Alternative:
                    this.getLiquorTreeApi().recurseDown((node) => {
                                node.states.checked = selectedNodeIds.includes(node.id);
                            });
                Problem: Does not check their parent if all children are checked, because it does not
                        trigger update on parent as we work with scripts not categories. */
            /*  Alternative:
                    this.getLiquorTreeApi().recurseDown((node) => {
                            if(selectedNodeIds.includes(node.id)) { node.select(); } else { node.unselect(); }
                    });
                Problem: Emits nodeSelected() event again which will cause an infinite loop. */
        }

        private getLiquorTreeApi(): ILiquorTree {
            if (!this.$refs.treeElement) {
                throw new Error('Referenced tree element cannot be found. Probably it\'s not rendered?');
            }
            return (this.$refs.treeElement as any).tree;
        }

        private getDefaults(): ILiquorTreeOptions {
            return {
                multiple: true,
                checkbox: true,
                checkOnSelect: true,
                autoCheckChildren: true,
                parentSelect: false,
                keyboardNavigation: true,
                deletion: (node) => !node.children || node.children.length === 0,
                filter: {
                    matcher: (query: string, node: ILiquorTreeExistingNode) => {
                        if (!this.filterPredicate) {
                            throw new Error('Cannot filter as predicate is null');
                        }
                        return this.filterPredicate(convertExistingToNode(node));
                    },
                    emptyText: '🕵️Hmm.. Can not see one 🧐',
                },
            };
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

    function updateCheckedState(
        oldNodes: ReadonlyArray<ILiquorTreeExistingNode>,
        selectedNodeIds: ReadonlyArray<string>): ReadonlyArray<ILiquorTreeNewNode> {
        const result = new Array<ILiquorTreeNewNode>();
        for (const oldNode of oldNodes) {
            const newState = oldNode.states;
            newState.checked = selectedNodeIds.some((id) => id === oldNode.id);
            const newNode: ILiquorTreeNewNode = {
                id: oldNode.id,
                text: oldNode.data.text,
                data: {
                    documentationUrls: oldNode.data.documentationUrls,
                },
                children: oldNode.children == null ? [] :
                        updateCheckedState(oldNode.children, selectedNodeIds),
                state: newState,
            };
            result.push(newNode);
        }
        return result;
    }
</script>


<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";

</style>