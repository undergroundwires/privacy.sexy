import type { SingleNodeFocusManager } from './Focus/SingleNodeFocusManager';
import type { TreeNodeCollection } from './NodeCollection/TreeNodeCollection';

export interface TreeRoot {
  readonly collection: TreeNodeCollection;
  readonly focus: SingleNodeFocusManager;
}
