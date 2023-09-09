import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { TreeNodeStateChangedEmittedEvent } from '@/presentation/components/Scripts/View/Tree/TreeView/Bindings/TreeNodeStateChangedEmittedEvent';
import { useCollectionSelectionStateUpdater } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/UseCollectionSelectionStateUpdater';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { HierarchyAccessStub } from '@tests/unit/shared/Stubs/HierarchyAccessStub';
import { TreeNodeStateAccessStub } from '@tests/unit/shared/Stubs/TreeNodeStateAccessStub';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { TreeNodeStateDescriptorStub } from '@tests/unit/shared/Stubs/TreeNodeStateDescriptorStub';
import { TreeNodeCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/CheckState';
import { NodeStateChangedEventStub } from '@tests/unit/shared/Stubs/NodeStateChangedEventStub';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import { UserSelectionStub } from '@tests/unit/shared/Stubs/UserSelectionStub';

describe('useCollectionSelectionStateUpdater', () => {
  describe('updateNodeSelection', () => {
    describe('when node is a branch node', () => {
      it('does nothing', () => {
        // arrange
        const { returnObject, useStateStub } = mountWrapperComponent();
        const mockEvent: TreeNodeStateChangedEmittedEvent = {
          node: createTreeNodeStub({
            isBranch: true,
            currentState: TreeNodeCheckState.Checked,
          }),
          change: new NodeStateChangedEventStub().withCheckStateChange({
            oldState: TreeNodeCheckState.Checked,
            newState: TreeNodeCheckState.Unchecked,
          }),
        };
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
        const mockEvent: TreeNodeStateChangedEmittedEvent = {
          node: createTreeNodeStub({
            isBranch: false,
            currentState: TreeNodeCheckState.Checked,
          }),
          change: new NodeStateChangedEventStub().withCheckStateChange({
            oldState: TreeNodeCheckState.Checked,
            newState: TreeNodeCheckState.Checked,
          }),
        };
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
        const mockEvent: TreeNodeStateChangedEmittedEvent = {
          node: new TreeNodeStub()
            .withHierarchy(new HierarchyAccessStub().withIsBranchNode(false))
            .withState(new TreeNodeStateAccessStub().withCurrent(
              new TreeNodeStateDescriptorStub().withCheckState(
                TreeNodeCheckState.Checked,
              ),
            )),
          change: new NodeStateChangedEventStub().withCheckStateChange({
            oldState: TreeNodeCheckState.Unchecked,
            newState: TreeNodeCheckState.Checked,
          }),
        };
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
        const mockEvent: TreeNodeStateChangedEmittedEvent = {
          node: createTreeNodeStub({
            isBranch: false,
            currentState: TreeNodeCheckState.Checked,
          }),
          change: new NodeStateChangedEventStub().withCheckStateChange({
            oldState: TreeNodeCheckState.Unchecked,
            newState: TreeNodeCheckState.Checked,
          }),
        };
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
        const mockEvent: TreeNodeStateChangedEmittedEvent = {
          node: createTreeNodeStub({
            isBranch: false,
            currentState: TreeNodeCheckState.Unchecked,
          }),
          change: new NodeStateChangedEventStub().withCheckStateChange({
            oldState: TreeNodeCheckState.Checked,
            newState: TreeNodeCheckState.Unchecked,
          }),
        };
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
        const mockEvent: TreeNodeStateChangedEmittedEvent = {
          node: createTreeNodeStub({
            isBranch: false,
            currentState: TreeNodeCheckState.Unchecked,
          }),
          change: new NodeStateChangedEventStub().withCheckStateChange({
            oldState: TreeNodeCheckState.Checked,
            newState: TreeNodeCheckState.Unchecked,
          }),
        };
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
    provide: {
      [InjectionKeys.useCollectionState as symbol]: () => useStateStub.get(),
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
    .withState(new TreeNodeStateAccessStub().withCurrent(
      new TreeNodeStateDescriptorStub().withCheckState(
        scenario.currentState,
      ),
    ));
}
