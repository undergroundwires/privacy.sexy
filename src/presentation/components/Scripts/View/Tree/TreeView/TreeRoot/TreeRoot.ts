import { SingleNodeFocusManager } from './Focus/SingleNodeFocusManager';
import { TreeNodeCollection } from './NodeCollection/TreeNodeCollection';

export interface TreeRoot {
  readonly collection: TreeNodeCollection;
  readonly focus: SingleNodeFocusManager;
}
