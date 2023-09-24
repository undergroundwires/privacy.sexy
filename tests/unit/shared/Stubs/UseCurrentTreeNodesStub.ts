import {
  WatchSource, readonly, shallowRef, triggerRef,
} from 'vue';
import { TreeRoot } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRoot';
import { useCurrentTreeNodes } from '@/presentation/components/Scripts/View/Tree/TreeView/UseCurrentTreeNodes';
import { QueryableNodes } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/Query/QueryableNodes';
import { QueryableNodesStub } from './QueryableNodesStub';

export class UseCurrentTreeNodesStub {
  public treeWatcher: WatchSource<TreeRoot> | undefined;

  private nodes = shallowRef<QueryableNodes>(new QueryableNodesStub());

  public withQueryableNodes(nodes: QueryableNodes): this {
    this.nodes.value = nodes;
    return this;
  }

  public triggerNewNodes(nodes: QueryableNodes) {
    this.nodes.value = nodes;
    triggerRef(this.nodes);
  }

  public get(): typeof useCurrentTreeNodes {
    return (treeWatcher: WatchSource<TreeRoot>) => {
      this.treeWatcher = treeWatcher;
      return {
        nodes: readonly(this.nodes),
      };
    };
  }
}
