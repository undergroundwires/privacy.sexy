import { SingleNodeCollectionFocusManager } from './Focus/SingleNodeCollectionFocusManager';
import { TreeNodeInitializerAndUpdater } from './NodeCollection/TreeNodeInitializerAndUpdater';
import type { TreeRoot } from './TreeRoot';
import type { TreeNodeCollection } from './NodeCollection/TreeNodeCollection';
import type { SingleNodeFocusManager } from './Focus/SingleNodeFocusManager';

export class TreeRootManager implements TreeRoot {
  public readonly collection: TreeNodeCollection;

  public readonly focus: SingleNodeFocusManager;

  constructor(
    collection: TreeNodeCollection = new TreeNodeInitializerAndUpdater(),
    createFocusManager: FocusManagerFactory = (
      nodes,
    ) => new SingleNodeCollectionFocusManager(nodes),
  ) {
    this.collection = collection;
    this.focus = createFocusManager(this.collection);
  }
}

export interface FocusManagerFactory {
  (
    collection: TreeNodeCollection
  ): SingleNodeFocusManager;
}
