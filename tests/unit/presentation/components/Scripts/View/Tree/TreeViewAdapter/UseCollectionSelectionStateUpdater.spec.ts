import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { useCollectionSelectionStateUpdater } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/UseCollectionSelectionStateUpdater';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { HierarchyAccessStub } from '@tests/unit/shared/Stubs/HierarchyAccessStub';
import { TreeNodeStateAccessStub } from '@tests/unit/shared/Stubs/TreeNodeStateAccessStub';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { TreeNodeCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/CheckState';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import { UserSelectionStub } from '@tests/unit/shared/Stubs/UserSelectionStub';
import { TreeNodeStateChangedEmittedEventStub } from '@tests/unit/shared/Stubs/TreeNodeStateChangedEmittedEventStub';

describe('useCollectionSelectionStateUpdater', () => {
  describe('updateNodeSelection', () => {
    describe('when node is a branch node', () => {
      it('does nothing', () => {
        // arrange
        const { returnObject, useStateStub } = mountWrapperComponent();
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
        const modifyCall = useStateStub.callHistory.find((call) => call.methodName === 'modifyCurrentState');
        expect(modifyCall).toBeUndefined();
      });
    });
    describe('when old and new check states are the same', () => {
      it('does nothing', () => {
        // arrange
        const { returnObject, useStateStub } = mountWrapperComponent();
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
        const modifyCall = useStateStub.callHistory.find((call) => call.methodName === 'modifyCurrentState');
        expect(modifyCall).toBeUndefined();
      });
    });
    describe('when checkState is checked', () => {
      it('adds to selection if not already selected', () => {
        // arrange
        const { returnObject, useStateStub } = mountWrapperComponent();
        const selectionStub = new UserSelectionStub([]);
        selectionStub.isSelected = () => false;
        useStateStub.withState(new CategoryCollectionStateStub().withSelection(selectionStub));
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
        const modifyCall = useStateStub.callHistory.find((call) => call.methodName === 'modifyCurrentState');
        expect(modifyCall).toBeDefined();
        const addSelectedScriptCall = selectionStub.callHistory.find((call) => call.methodName === 'addSelectedScript');
        expect(addSelectedScriptCall).toBeDefined();
      });
      it('does nothing if already selected', () => {
        // arrange
        const { returnObject, useStateStub } = mountWrapperComponent();
        const selectionStub = new UserSelectionStub([]);
        selectionStub.isSelected = () => true;
        useStateStub.withState(new CategoryCollectionStateStub().withSelection(selectionStub));
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
        const modifyCall = useStateStub.callHistory.find((call) => call.methodName === 'modifyCurrentState');
        expect(modifyCall).toBeUndefined();
      });
    });
    describe('when checkState is unchecked', () => {
      it('removes from selection if already selected', () => {
        // arrange
        const { returnObject, useStateStub } = mountWrapperComponent();
        const selectionStub = new UserSelectionStub([]);
        selectionStub.isSelected = () => true;
        useStateStub.withState(new CategoryCollectionStateStub().withSelection(selectionStub));
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
        const modifyCall = useStateStub.callHistory.find((call) => call.methodName === 'modifyCurrentState');
        expect(modifyCall).toBeDefined();
        const removeSelectedScriptCall = selectionStub.callHistory.find((call) => call.methodName === 'removeSelectedScript');
        expect(removeSelectedScriptCall).toBeDefined();
      });
      it('does nothing if not already selected', () => {
        // arrange
        const { returnObject, useStateStub } = mountWrapperComponent();
        const selectionStub = new UserSelectionStub([]);
        selectionStub.isSelected = () => false;
        useStateStub.withState(new CategoryCollectionStateStub().withSelection(selectionStub));
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
        const modifyCall = useStateStub.callHistory.find((call) => call.methodName === 'modifyCurrentState');
        expect(modifyCall).toBeUndefined();
      });
    });
  });
});

function mountWrapperComponent() {
  const useStateStub = new UseCollectionStateStub();
  let returnObject: ReturnType<typeof useCollectionSelectionStateUpdater>;

  shallowMount({
    setup() {
      returnObject = useCollectionSelectionStateUpdater();
    },
    template: '<div></div>',
  }, {
    global: {
      provide: {
        [InjectionKeys.useCollectionState.key]: () => useStateStub.get(),
      },
    },
  });

  return {
    returnObject,
    useStateStub,
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
