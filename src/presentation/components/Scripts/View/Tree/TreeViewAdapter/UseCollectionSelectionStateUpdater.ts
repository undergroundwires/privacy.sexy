import { useUserSelectionState } from '@/presentation/components/Shared/Hooks/UseUserSelectionState';
import { injectKey } from '@/presentation/injectionSymbols';
import type { ExecutableId, ExecutableKey } from '@/domain/Executables/Identifiable/ExecutableKey/ExecutableKey';
import { TreeNodeCheckState } from '../TreeView/Node/State/CheckState';
import { getScriptKey } from './CategoryNodeMetadataConverter';
import type { TreeNodeStateChangedEmittedEvent } from '../TreeView/Bindings/TreeNodeStateChangedEmittedEvent';

export function useCollectionSelectionStateUpdater(
  useSelectionStateHook: ReturnType<typeof useUserSelectionState>,
  useCurrentStateHook = injectKey((keys) => keys.useCollectionState), // TODO: Not tested
) {
  const { modifyCurrentSelection, currentSelection } = useSelectionStateHook;
  const { currentState } = useCurrentStateHook;

  function convertToScriptKey(nodeId: ExecutableId): ExecutableKey {
    return getScriptKey(nodeId, currentState.value.collection);
  }

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
              scriptKey: convertToScriptKey(node.id),
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
              scriptKey: convertToScriptKey(node.id),
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
