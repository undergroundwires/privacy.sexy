import type { ReadOnlyTreeNode, TreeNode } from '../../Node/TreeNode';
import type { TreeNodeCollection } from '../NodeCollection/TreeNodeCollection';
import type { SingleNodeFocusManager } from './SingleNodeFocusManager';

export class SingleNodeCollectionFocusManager implements SingleNodeFocusManager {
  public get currentSingleFocusedNode(): TreeNode | undefined {
    const focusedNodes = this.collection.nodes.flattenedNodes.filter(
      (node) => node.state.current.isFocused,
    );
    return focusedNodes.length === 1 ? focusedNodes[0] : undefined;
  }

  public setSingleFocus(focusedNode: ReadOnlyTreeNode): void {
    this.collection.nodes.flattenedNodes.forEach((node) => {
      const isFocused = node === focusedNode;
      node.state.commitTransaction(node.state.beginTransaction().withFocusState(isFocused));
    });
  }

  constructor(private readonly collection: TreeNodeCollection) { }
}
