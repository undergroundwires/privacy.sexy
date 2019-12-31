<template>
    <span>
        <span v-if="initialNodes != null && initialNodes.length > 0">
            <tree :options="liquorTreeOptions"
                  :data="this.initialNodes"
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
    import LiquorTree, { ILiquorTreeNewNode, ILiquorTreeExistingNode, ILiquorTree } from 'liquor-tree';
    import Node from './Node.vue';
    import { INode } from './INode';
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
        @Prop() public nodes?: INode[];

        public initialNodes?: ILiquorTreeNewNode[] = null;
        public liquorTreeOptions = this.getLiquorTreeOptions();

        public mounted() {
            // console.log('Mounted', 'initial nodes', this.nodes);
            // console.log('Mounted', 'initial model', this.getLiquorTreeApi().model);

            if (this.nodes) {
                this.initialNodes = this.nodes.map((node) => this.toLiquorTreeNode(node));
            } else {
                throw new Error('Initial nodes are null or empty');
            }

            if (this.filterText) {
               this.updateFilterText(this.filterText);
            }
        }

        public nodeSelected(node: ILiquorTreeExistingNode) {
            this.$emit('nodeSelected', this.convertExistingToNode(node));
            return;
        }

        @Watch('filterText')
        public updateFilterText(filterText: |string) {
            const api = this.getLiquorTreeApi();
            if (!filterText) {
                api.clearFilter();
            } else {
                api.filter('filtered'); // text does not matter, it'll trigger the predicate
            }
        }

        @Watch('nodes', {deep: true})
        public setSelectedStatus(nodes: |ReadonlyArray<INode>) {
            if (!nodes || nodes.length === 0) {
                throw new Error('Updated nodes are null or empty');
            }
            // Update old node properties, re-setting it changes expanded status etc.
            // It'll not be needed when this is merged: https://github.com/amsik/liquor-tree/pull/141
            const updateCheckedState = (
                oldNodes: ReadonlyArray<ILiquorTreeExistingNode>,
                updatedNodes: ReadonlyArray<INode>): ILiquorTreeNewNode[] => {
                    const newNodes = new Array<ILiquorTreeNewNode>();
                    for (const oldNode of oldNodes) {
                                for (const updatedNode of updatedNodes) {
                                    if (oldNode.id === updatedNode.id) {
                                        const newState = oldNode.states;
                                        newState.checked = updatedNode.selected;
                                        newNodes.push({
                                            id: oldNode.id,
                                            text: updatedNode.text,
                                            children: oldNode.children == null ? [] :
                                                updateCheckedState(
                                                    oldNode.children,
                                                    updatedNode.children),
                                            state: newState,
                                            data: {
                                                documentationUrls: oldNode.data.documentationUrls,
                                            },
                                        });
                                    }
                                }
                            }
                    return newNodes;
            };
            const newModel = updateCheckedState(
                this.getLiquorTreeApi().model, nodes);
            this.getLiquorTreeApi().setModel(newModel);
        }

        private convertItem(liquorTreeNode: ILiquorTreeNewNode): INode {
            if (!liquorTreeNode) { throw new Error('liquorTreeNode is undefined'); }
            return {
                id: liquorTreeNode.id,
                text: liquorTreeNode.text,
                selected: liquorTreeNode.state && liquorTreeNode.state.checked,
                children: (!liquorTreeNode.children || liquorTreeNode.children.length === 0)
                 ? [] : liquorTreeNode.children.map((childNode) => this.convertItem(childNode)),
                documentationUrls: liquorTreeNode.data.documentationUrls,
            };
        }

        private convertExistingToNode(liquorTreeNode: ILiquorTreeExistingNode): INode {
            if (!liquorTreeNode) { throw new Error('liquorTreeNode is undefined'); }
            return {
                id: liquorTreeNode.id,
                text: liquorTreeNode.data.text,
                selected: liquorTreeNode.states && liquorTreeNode.states.checked,
                children: (!liquorTreeNode.children || liquorTreeNode.children.length === 0)
                 ? [] : liquorTreeNode.children.map((childNode) => this.convertExistingToNode(childNode)),
                documentationUrls: liquorTreeNode.data.documentationUrls,
            };
        }


        private toLiquorTreeNode(node: INode): ILiquorTreeNewNode {
            if (!node) { throw new Error('node is undefined'); }
            return {
                id: node.id,
                text: node.text,
                state: {
                    checked: node.selected,
                },
                children: (!node.children || node.children.length === 0) ? [] :
                 node.children.map((childNode) => this.toLiquorTreeNode(childNode)),
                data: {
                    documentationUrls: node.documentationUrls,
                },
            };
        }

        private getLiquorTreeOptions(): any {
            return {
                checkbox: true,
                checkOnSelect: true,
                deletion: (node) => !node.children || node.children.length === 0,
                filter: {
                    matcher: (query: string, node: ILiquorTreeExistingNode) => {
                        if (!this.filterPredicate) {
                            throw new Error('Cannot filter as predicate is null');
                        }
                        return this.filterPredicate(this.convertExistingToNode(node));
                    },
                    emptyText: '🕵️Hmm.. Can not see one 🧐',
                },
            };
        }

        private getLiquorTreeApi(): ILiquorTree {
            if (!this.$refs.treeElement) {
                throw new Error('Referenced tree element cannot be found. Probably it\'s not rendered?');
            }
            return (this.$refs.treeElement as any).tree;
        }
    }

</script>


<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";

</style>