import {
  type Ref, shallowReadonly, shallowRef, triggerRef,
} from 'vue';
import type { TreeRoot } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRoot';
import { useCurrentTreeNodes } from '@/presentation/components/Scripts/View/Tree/TreeView/UseCurrentTreeNodes';
import type { QueryableNodes } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/Query/QueryableNodes';
import { QueryableNodesStub } from './QueryableNodesStub';

export class UseCurrentTreeNodesStub {
  public treeRootRef: Readonly<Ref<TreeRoot>> | undefined;

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
    return (treeRootRef: Readonly<Ref<TreeRoot>>) => {
      this.treeRootRef = treeRootRef;
      return {
        nodes: shallowReadonly(this.nodes),
      };
    };
  }
}
