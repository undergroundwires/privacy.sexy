import { ILiquorTreeOptions, ILiquorTreeFilter, ILiquorTreeNode, ILiquorTreeExistingNode } from 'liquor-tree';

export class LiquorTreeOptions implements ILiquorTreeOptions {
    public readonly multiple = true;
    public readonly checkbox = true;
    public readonly checkOnSelect = true;
    /*  For checkbox mode only. Children will have the same checked state as their parent.
        ⚠️ Setting this false, does not update indeterminate state of nodes.
        This is false as it's handled manually to be able to batch select for performance + highlighting */
    public readonly autoCheckChildren = false;
    public readonly parentSelect = true;
    public readonly keyboardNavigation = true;
    public readonly filter = { // Wrap this in an arrow function as setting filter directly does not work JS APIs
        emptyText: this.liquorTreeFilter.emptyText,
        matcher: (query: string, node: ILiquorTreeExistingNode) => {
            return this.liquorTreeFilter.matcher(query, node);
        },
    };
    constructor(private readonly liquorTreeFilter: ILiquorTreeFilter) { }
    public deletion(node: ILiquorTreeNode): boolean {
        return false; // no op
    }
}
