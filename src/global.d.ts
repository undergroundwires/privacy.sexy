
// Two ways of typing other libraries: https://stackoverflow.com/a/53070501

declare module 'liquor-tree' {
    import { PluginObject } from 'vue';
    import { VueClass } from 'vue-class-component/lib/declarations';
    // https://github.com/amsik/liquor-tree/blob/master/src/lib/Tree.js
    export interface ILiquorTree {
        readonly model: ReadonlyArray<ILiquorTreeExistingNode>;
        filter(query: string): void;
        clearFilter(): void;
        setModel(nodes: ReadonlyArray<ILiquorTreeNewNode>): void;
    }
    interface ICustomLiquorTreeData {
        documentationUrls: ReadonlyArray<string>;
    }
    /**
        * Returned from Node tree view events.
        * See constructor in https://github.com/amsik/liquor-tree/blob/master/src/lib/Node.js
        */
    export interface ILiquorTreeExistingNode {
        id: string;
        data: ILiquorTreeNodeData;
        states: ILiquorTreeNodeState | undefined;
        children: ReadonlyArray<ILiquorTreeExistingNode> | undefined;
    }
    /**
        * Sent to liquor tree to define of new nodes.
        * https://github.com/amsik/liquor-tree/blob/master/src/lib/Node.js
        */
    export interface ILiquorTreeNewNode {
        id: string;
        text: string;
        state: ILiquorTreeNodeState | undefined;
        children: ReadonlyArray<ILiquorTreeNewNode> | undefined;
        data: ICustomLiquorTreeData;
    }
    // https://github.com/amsik/liquor-tree/blob/master/src/lib/Node.js
    interface ILiquorTreeNodeState {
        checked: boolean;
    }
    interface ILiquorTreeNodeData extends ICustomLiquorTreeData {
        text: string;
    }
    // https://github.com/amsik/liquor-tree/blob/master/src/components/TreeRoot.vue
    interface ILiquorTreeOptions {
        checkbox: boolean;
        checkOnSelect: boolean;
        filter: ILiquorTreeFilter;
        deletion(node: ILiquorTreeNewNode): boolean;
    }
    // https://github.com/amsik/liquor-tree/blob/master/src/components/TreeRoot.vue
    interface ILiquorTreeFilter {
        emptyText: string;
        matcher(query: string, node: ILiquorTreeNewNode): boolean;
    }
    const LiquorTree: PluginObject<any> & VueClass<any>;
    export default LiquorTree;
}
