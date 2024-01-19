import { describe, it, expect } from 'vitest';
import { useCollectionSelectionStateUpdater } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/UseCollectionSelectionStateUpdater';
import { HierarchyAccessStub } from '@tests/unit/shared/Stubs/HierarchyAccessStub';
import { TreeNodeStateAccessStub } from '@tests/unit/shared/Stubs/TreeNodeStateAccessStub';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { TreeNodeCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/CheckState';
import { UserSelectionStub } from '@tests/unit/shared/Stubs/UserSelectionStub';
import { TreeNodeStateChangedEmittedEventStub } from '@tests/unit/shared/Stubs/TreeNodeStateChangedEmittedEventStub';
import { UseUserSelectionStateStub } from '@tests/unit/shared/Stubs/UseUserSelectionStateStub';
import { ScriptSelectionStub } from '@tests/unit/shared/Stubs/ScriptSelectionStub';

describe('useCollectionSelectionStateUpdater', () => {
  describe('updateNodeSelection', () => {
    describe('when node is a branch node', () => {
      it('does nothing', () => {
        // arrange
        const { returnObject, useSelectionStateStub } = runHook();
        const mockEvent = new TreeNodeStateChangedEmittedEventStub()
          .withNode(
            createTreeNodeStub({
              isBranch: true,
              currentState: TreeNodeCheckState.Checked,
            }),
          )
          .withCheckStateChange({
            oldState: TreeNodeCheckState.Checked,
            newState: TreeNodeCheckState.Unchecked,
          });
        // act
        returnObject.updateNodeSelection(mockEvent);
        // assert
        expect(useSelectionStateStub.isSelectionModified()).to.equal(false);
      });
    });
    describe('when old and new check states are the same', () => {
      it('does nothing', () => {
        // arrange
        const { returnObject, useSelectionStateStub } = runHook();
        const mockEvent = new TreeNodeStateChangedEmittedEventStub()
          .withNode(
            createTreeNodeStub({
              isBranch: false,
              currentState: TreeNodeCheckState.Checked,
            }),
          )
          .withCheckStateChange({
            oldState: TreeNodeCheckState.Checked,
            newState: TreeNodeCheckState.Checked,
          });
        // act
        returnObject.updateNodeSelection(mockEvent);
        // assert
        expect(useSelectionStateStub.isSelectionModified()).to.equal(false);
      });
    });
    describe('when checkState is checked', () => {
      it('adds to selection if not already selected', () => {
        // arrange
        const { returnObject, useSelectionStateStub } = runHook();
        const isScriptInitiallySelected = false;
        const scriptSelectionStub = new ScriptSelectionStub()
          .withIsSelectedResult(isScriptInitiallySelected);
        useSelectionStateStub.withUserSelection(
          new UserSelectionStub().withScripts(scriptSelectionStub),
        );
        const node = createTreeNodeStub({
          isBranch: false,
          currentState: TreeNodeCheckState.Checked,
        });
        const mockEvent = new TreeNodeStateChangedEmittedEventStub()
          .withNode(node)
          .withCheckStateChange({
            oldState: TreeNodeCheckState.Unchecked,
            newState: TreeNodeCheckState.Checked,
          });
        // act
        returnObject.updateNodeSelection(mockEvent);
        // assert
        expect(useSelectionStateStub.isSelectionModified()).to.equal(true);
        expect(scriptSelectionStub.isScriptSelected(node.id, false)).to.equal(true);
      });
      it('does nothing if already selected', () => {
        // arrange
        const { returnObject, useSelectionStateStub } = runHook();
        const isScriptInitiallySelected = true;
        const scriptSelectionStub = new ScriptSelectionStub()
          .withIsSelectedResult(isScriptInitiallySelected);
        useSelectionStateStub.withUserSelection(
          new UserSelectionStub().withScripts(scriptSelectionStub),
        );
        const mockEvent = new TreeNodeStateChangedEmittedEventStub()
          .withNode(
            createTreeNodeStub({
              isBranch: false,
              currentState: TreeNodeCheckState.Checked,
            }),
          )
          .withCheckStateChange({
            oldState: TreeNodeCheckState.Unchecked,
            newState: TreeNodeCheckState.Checked,
          });
        // act
        returnObject.updateNodeSelection(mockEvent);
        // assert
        expect(useSelectionStateStub.isSelectionModified()).to.equal(false);
      });
    });
    describe('when checkState is unchecked', () => {
      it('removes from selection if already selected', () => {
        // arrange
        const { returnObject, useSelectionStateStub } = runHook();
        const isScriptInitiallySelected = true;
        const scriptSelectionStub = new ScriptSelectionStub()
          .withIsSelectedResult(isScriptInitiallySelected);
        useSelectionStateStub.withUserSelection(
          new UserSelectionStub().withScripts(scriptSelectionStub),
        );
        const node = createTreeNodeStub({
          isBranch: false,
          currentState: TreeNodeCheckState.Unchecked,
        });
        const mockEvent = new TreeNodeStateChangedEmittedEventStub()
          .withNode(node)
          .withCheckStateChange({
            oldState: TreeNodeCheckState.Checked,
            newState: TreeNodeCheckState.Unchecked,
          });
        // act
        returnObject.updateNodeSelection(mockEvent);
        // assert
        expect(useSelectionStateStub.isSelectionModified()).to.equal(true);
        expect(scriptSelectionStub.isScriptDeselected(node.id)).to.equal(true);
      });
      it('does nothing if not already selected', () => {
        // arrange
        const { returnObject, useSelectionStateStub } = runHook();
        const isScriptInitiallySelected = false;
        const scriptSelectionStub = new ScriptSelectionStub()
          .withIsSelectedResult(isScriptInitiallySelected);
        useSelectionStateStub.withUserSelection(
          new UserSelectionStub().withScripts(scriptSelectionStub),
        );
        const mockEvent = new TreeNodeStateChangedEmittedEventStub()
          .withNode(
            createTreeNodeStub({
              isBranch: false,
              currentState: TreeNodeCheckState.Unchecked,
            }),
          )
          .withCheckStateChange({
            oldState: TreeNodeCheckState.Checked,
            newState: TreeNodeCheckState.Unchecked,
          });
        // act
        returnObject.updateNodeSelection(mockEvent);
        // assert
        expect(useSelectionStateStub.isSelectionModified()).to.equal(false);
      });
    });
  });
});

function runHook() {
  const useSelectionStateStub = new UseUserSelectionStateStub();
  const returnObject = useCollectionSelectionStateUpdater(useSelectionStateStub.get());
  return {
    returnObject,
    useSelectionStateStub,
  };
}

function createTreeNodeStub(scenario: {
  readonly isBranch: boolean,
  readonly currentState: TreeNodeCheckState,
}) {
  return new TreeNodeStub()
    .withHierarchy(new HierarchyAccessStub().withIsBranchNode(scenario.isBranch))
    .withState(new TreeNodeStateAccessStub().withCurrentCheckState(scenario.currentState));
}
