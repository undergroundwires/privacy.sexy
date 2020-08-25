import { ILiquorTreeOptions, ILiquorTreeFilter, ILiquorTreeNode } from 'liquor-tree';

export class LiquorTreeOptions implements ILiquorTreeOptions {
    public multiple = true;
    public checkbox = true;
    public checkOnSelect = true;
    /*  For checkbox mode only. Children will have the same checked state as their parent.
        This is false as it's handled manually to be able to batch select for performance + highlighting */
    public autoCheckChildren = true;
    public parentSelect = false;
    public keyboardNavigation = true;
    constructor(public filter: ILiquorTreeFilter) { }
    public deletion(node: ILiquorTreeNode): boolean {
        return false; // no op
    }
}
