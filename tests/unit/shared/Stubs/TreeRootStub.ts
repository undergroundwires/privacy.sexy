import type { SingleNodeFocusManager } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/Focus/SingleNodeFocusManager';
import type { TreeNodeCollection } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/TreeNodeCollection';
import type { TreeRoot } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRoot';
import { TreeNodeCollectionStub } from './TreeNodeCollectionStub';
import { SingleNodeFocusManagerStub } from './SingleNodeFocusManagerStub';

export class TreeRootStub implements TreeRoot {
  public collection: TreeNodeCollection = new TreeNodeCollectionStub();

  public focus: SingleNodeFocusManager = new SingleNodeFocusManagerStub();

  public withCollection(collection: TreeNodeCollection): this {
    this.collection = collection;
    return this;
  }
}
