import { TreeRoot } from './TreeRoot';
import { TreeNodeInitializerAndUpdater } from './NodeCollection/TreeNodeInitializerAndUpdater';
import { TreeNodeCollection } from './NodeCollection/TreeNodeCollection';
import { SingleNodeFocusManager } from './Focus/SingleNodeFocusManager';
import { SingleNodeCollectionFocusManager } from './Focus/SingleNodeCollectionFocusManager';

export class TreeRootManager implements TreeRoot {
  public readonly collection: TreeNodeCollection;

  public readonly focus: SingleNodeFocusManager;

  constructor(
    collection: TreeNodeCollection = new TreeNodeInitializerAndUpdater(),
    createFocusManager: (
      collection: TreeNodeCollection
    ) => SingleNodeFocusManager = (nodes) => new SingleNodeCollectionFocusManager(nodes),
  ) {
    this.collection = collection;
    this.focus = createFocusManager(this.collection);
  }
}
