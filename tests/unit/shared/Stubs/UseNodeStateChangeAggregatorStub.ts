import type { TreeRoot } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRoot';
import type {
  NodeStateChangeEventArgs,
  NodeStateChangeEventCallback,
  useNodeStateChangeAggregator,
} from '@/presentation/components/Scripts/View/Tree/TreeView/UseNodeStateChangeAggregator';
import type { Ref } from 'vue';

export class UseNodeStateChangeAggregatorStub {
  public callback: NodeStateChangeEventCallback | undefined;

  public treeRootRef: Readonly<Ref<TreeRoot>> | undefined;

  public onNodeStateChange(callback: NodeStateChangeEventCallback) {
    this.callback = callback;
  }

  public notifyChange(change: NodeStateChangeEventArgs) {
    if (!this.callback) {
      throw new Error('callback is not set');
    }
    this.callback(change);
  }

  public get(): typeof useNodeStateChangeAggregator {
    return (treeRootRef: Readonly<Ref<TreeRoot>>) => {
      this.treeRootRef = treeRootRef;
      return {
        onNodeStateChange: this.onNodeStateChange.bind(this),
      };
    };
  }
}
