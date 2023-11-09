import { injectKey } from '@/presentation/injectionSymbols';
import { TreeNodeCheckState } from '../TreeView/Node/State/CheckState';
import { TreeNodeStateChangedEmittedEvent } from '../TreeView/Bindings/TreeNodeStateChangedEmittedEvent';

export function useCollectionSelectionStateUpdater() {
  const { modifyCurrentState, currentState } = injectKey((keys) => keys.useCollectionState);

  function updateNodeSelection(change: TreeNodeStateChangedEmittedEvent) {
    const { node } = change;
    if (node.hierarchy.isBranchNode) {
      return; // A category, let TreeView handle this
    }
    if (change.oldState?.checkState === change.newState.checkState) {
      return;
    }
    if (node.state.current.checkState === TreeNodeCheckState.Checked) {
      if (currentState.value.selection.isSelected(node.id)) {
        return;
      }
      modifyCurrentState((state) => {
        state.selection.addSelectedScript(node.id, false);
      });
    }
    if (node.state.current.checkState === TreeNodeCheckState.Unchecked) {
      if (!currentState.value.selection.isSelected(node.id)) {
        return;
      }
      modifyCurrentState((state) => {
        state.selection.removeSelectedScript(node.id);
      });
    }
  }

  return {
    updateNodeSelection,
  };
}
