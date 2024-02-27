import { useUserSelectionState } from '@/presentation/components/Shared/Hooks/UseUserSelectionState';
import { TreeNodeCheckState } from '../TreeView/Node/State/CheckState';
import type { TreeNodeStateChangedEmittedEvent } from '../TreeView/Bindings/TreeNodeStateChangedEmittedEvent';

export function useCollectionSelectionStateUpdater(
  useSelectionStateHook: ReturnType<typeof useUserSelectionState>,
) {
  const { modifyCurrentSelection, currentSelection } = useSelectionStateHook;

  function updateNodeSelection(change: TreeNodeStateChangedEmittedEvent) {
    const { node } = change;
    if (node.hierarchy.isBranchNode) {
      return; // A category, let TreeView handle this
    }
    if (change.oldState?.checkState === change.newState.checkState) {
      return;
    }
    if (node.state.current.checkState === TreeNodeCheckState.Checked) {
      if (currentSelection.value.scripts.isSelected(node.id)) {
        return;
      }
      modifyCurrentSelection((selection) => {
        selection.scripts.processChanges({
          changes: [
            {
              scriptId: node.id,
              newStatus: {
                isSelected: true,
                isReverted: false,
              },
            },
          ],
        });
      });
    }
    if (node.state.current.checkState === TreeNodeCheckState.Unchecked) {
      if (!currentSelection.value.scripts.isSelected(node.id)) {
        return;
      }
      modifyCurrentSelection((selection) => {
        selection.scripts.processChanges({
          changes: [
            {
              scriptId: node.id,
              newStatus: {
                isSelected: false,
              },
            },
          ],
        });
      });
    }
  }

  return {
    updateNodeSelection,
  };
}
