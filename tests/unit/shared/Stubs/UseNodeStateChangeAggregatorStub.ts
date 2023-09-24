import { WatchSource } from 'vue';
import { TreeRoot } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRoot';
import {
  NodeStateChangeEventArgs,
  NodeStateChangeEventCallback,
  useNodeStateChangeAggregator,
} from '@/presentation/components/Scripts/View/Tree/TreeView/UseNodeStateChangeAggregator';

export class UseNodeStateChangeAggregatorStub {
  public callback: NodeStateChangeEventCallback | undefined;

  public treeWatcher: WatchSource<TreeRoot> | undefined;

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
    return (treeWatcher: WatchSource<TreeRoot>) => {
      this.treeWatcher = treeWatcher;
      return {
        onNodeStateChange: this.onNodeStateChange.bind(this),
      };
    };
  }
}
