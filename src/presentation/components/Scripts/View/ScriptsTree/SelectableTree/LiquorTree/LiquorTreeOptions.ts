import { ILiquorTreeOptions, ILiquorTreeFilter, ILiquorTreeExistingNode } from 'liquor-tree';

export class LiquorTreeOptions implements ILiquorTreeOptions {
  public readonly multiple = true;

  public readonly checkbox = true;

  public readonly checkOnSelect = true;

  /*
      For checkbox mode only. Children will have the same checked state as their parent.
      ⚠️ Setting this false does not prevent updating indeterminate state of nodes.
      It's set to false anyway because state is handled manually, and this way batch selections can
      be done in more performant way.
  */
  public readonly autoCheckChildren = false;

  public readonly parentSelect = true;

  public readonly keyboardNavigation = true;

  /*
    Filter is wrapped in an arrow function because setting filter directly does not work with
    underling JavaScript APIs.
  */
  public readonly filter = {
    emptyText: this.liquorTreeFilter.emptyText,
    matcher: (query: string, node: ILiquorTreeExistingNode) => {
      return this.liquorTreeFilter.matcher(query, node);
    },
  };

  constructor(private readonly liquorTreeFilter: ILiquorTreeFilter) { }

  public deletion(): boolean {
    return false; // no op
  }
}
