
declare module 'liquor-tree' {
    import { PluginObject } from 'vue';
    import { VueClass } from 'vue-class-component/lib/declarations';

    // https://github.com/amsik/liquor-tree/blob/master/src/lib/Tree.js
    export interface ILiquorTree {
        readonly model: ReadonlyArray<ILiquorTreeExistingNode>;
        filter(query: string): void;
        clearFilter(): void;
        setModel(nodes: ReadonlyArray<ILiquorTreeNewNode>): void;
        // getNodeById(id: string):  ILiquorTreeExistingNode;
        recurseDown(fn: (node: ILiquorTreeExistingNode) => void): void;
    }
    export interface ICustomLiquorTreeData {
        type: number;
        documentationUrls: ReadonlyArray<string>;
        isReversible: boolean;
    }
    // https://github.com/amsik/liquor-tree/blob/master/src/lib/Node.js
    export interface ILiquorTreeNodeState {
        checked: boolean;
        indeterminate: boolean;
    }

    export interface ILiquorTreeNode {
        id: string;
        data: ICustomLiquorTreeData;
        children: ReadonlyArray<ILiquorTreeNode> | undefined;
    }
    /**
     * Returned from Node tree view events.
     * See constructor in https://github.com/amsik/liquor-tree/blob/master/src/lib/Node.js
     */
    export interface ILiquorTreeExistingNode extends ILiquorTreeNode {
        data: ILiquorTreeNodeData;
        states: ILiquorTreeNodeState | undefined;
        children: ReadonlyArray<ILiquorTreeExistingNode> | undefined;
        // expand(): void;
    }

    /**
     * Sent to liquor tree to define of new nodes.
     * https://github.com/amsik/liquor-tree/blob/master/src/lib/Node.js
     */
    export interface ILiquorTreeNewNode extends ILiquorTreeNode {
        text: string;
        state: ILiquorTreeNodeState | undefined;
        children: ReadonlyArray<ILiquorTreeNewNode> | undefined;
    }

    // https://amsik.github.io/liquor-tree/#Component-Options
    export interface ILiquorTreeOptions {
        multiple: boolean;
        checkbox: boolean;
        checkOnSelect: boolean;
        autoCheckChildren: boolean;
        parentSelect: boolean;
        keyboardNavigation: boolean;
        filter: ILiquorTreeFilter;
        deletion(node: ILiquorTreeNode): boolean;
    }

    export interface ILiquorTreeNodeData extends ICustomLiquorTreeData {
        text: string;
    }

    // https://github.com/amsik/liquor-tree/blob/master/src/components/TreeRoot.vue
    export interface ILiquorTreeFilter {
        emptyText: string;
        matcher(query: string, node: ILiquorTreeExistingNode): boolean;
    }

    const LiquorTree: PluginObject<any> & VueClass<any>;
    export default LiquorTree;
}
