import { expect } from 'vitest';
import { TreeNodeState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/TreeNodeState';
import { TreeNodeStateDescriptor } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateDescriptor';
import { TreeNodeCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/CheckState';
import { NodeStateChangedEvent, TreeNodeStateTransaction } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateAccess';
import { PropertyKeys } from '@/TypeHelpers';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('TreeNodeState', () => {
  describe('beginTransaction', () => {
    it('begins empty transaction', () => {
      // arrange
      const treeNodeState = new TreeNodeState();
      // act
      const transaction = treeNodeState.beginTransaction();
      // assert
      expect(Object.keys(transaction.updatedState)).to.have.lengthOf(0);
    });
  });
  describe('commitTransaction', () => {
    it('should update the current state with transaction changes', () => {
      // arrange
      const treeNodeState = new TreeNodeState();
      const initialState: TreeNodeStateDescriptor = treeNodeState.current;
      const transaction = treeNodeState
        .beginTransaction()
        .withCheckState(TreeNodeCheckState.Checked);
      // act
      treeNodeState.commitTransaction(transaction);
      // assert
      expect(treeNodeState.current.checkState).to.equal(TreeNodeCheckState.Checked);
      expect(treeNodeState.current.isExpanded).to.equal(initialState.isExpanded);
    });

    it('should notify when state changes', () => {
      // arrange
      const treeNodeState = new TreeNodeState();
      const transaction = treeNodeState
        .beginTransaction()
        .withCheckState(TreeNodeCheckState.Checked);
      let notifiedEvent: NodeStateChangedEvent | undefined;
      // act
      treeNodeState.changed.on((event) => {
        notifiedEvent = event;
      });
      treeNodeState.commitTransaction(transaction);
      // assert
      expectExists(notifiedEvent);
      expect(notifiedEvent.oldState.checkState).to.equal(TreeNodeCheckState.Unchecked);
      expect(notifiedEvent.newState.checkState).to.equal(TreeNodeCheckState.Checked);
    });

    it('should not notify when state does not change', () => {
      // arrange
      const treeNodeState = new TreeNodeState();
      const currentState = treeNodeState.current;
      let transaction = treeNodeState
        .beginTransaction();
      const updateActions: {
        readonly [K in PropertyKeys<TreeNodeStateDescriptor>]: (
          describer: TreeNodeStateTransaction,
        ) => TreeNodeStateTransaction;
      } = {
        checkState: (describer) => describer.withCheckState(currentState.checkState),
        isExpanded: (describer) => describer.withExpansionState(currentState.isExpanded),
        isFocused: (describer) => describer.withFocusState(currentState.isFocused),
        isVisible: (describer) => describer.withVisibilityState(currentState.isVisible),
        isMatched: (describer) => describer.withMatchState(currentState.isMatched),
      };
      Object.values(updateActions).forEach((updateTransaction) => {
        transaction = updateTransaction(transaction);
      });
      let isNotified = false;
      // act
      treeNodeState.changed.on(() => {
        isNotified = true;
      });
      treeNodeState.commitTransaction(transaction);
      // assert
      expect(isNotified).to.equal(false);
    });
  });

  describe('toggleCheck', () => {
    describe('transitions state as expected', () => {
      interface ToggleCheckTestScenario {
        readonly initialState: TreeNodeCheckState;
        readonly expectedState: TreeNodeCheckState;
      }
      const testCases: readonly ToggleCheckTestScenario[] = [
        {
          initialState: TreeNodeCheckState.Unchecked,
          expectedState: TreeNodeCheckState.Checked,
        },
        {
          initialState: TreeNodeCheckState.Checked,
          expectedState: TreeNodeCheckState.Unchecked,
        },
        {
          initialState: TreeNodeCheckState.Indeterminate,
          expectedState: TreeNodeCheckState.Unchecked,
        },
      ];
      testCases.forEach(({ initialState, expectedState }) => {
        it(`should toggle checkState from ${TreeNodeCheckState[initialState]} to ${TreeNodeCheckState[expectedState]}`, () => {
          // arrange
          const treeNodeState = new TreeNodeState();
          treeNodeState.commitTransaction(
            treeNodeState.beginTransaction().withCheckState(initialState),
          );
          // act
          treeNodeState.toggleCheck();
          // assert
          expect(treeNodeState.current.checkState).to.equal(expectedState);
        });
      });
    });
    it('should emit changed event', () => {
      // arrange
      const treeNodeState = new TreeNodeState();
      let isNotified = false;
      treeNodeState.changed.on(() => {
        isNotified = true;
      });
      // act
      treeNodeState.toggleCheck();
      // assert
      expect(isNotified).to.equal(true);
    });
  });

  describe('toggleExpand', () => {
    describe('transitions state as expected', () => {
      interface ToggleExpandTestScenario {
        readonly initialState: boolean;
        readonly expectedState: boolean;
      }
      const testCases: readonly ToggleExpandTestScenario[] = [
        {
          initialState: true,
          expectedState: false,
        },
        {
          initialState: false,
          expectedState: true,
        },
      ];
      testCases.forEach(({ initialState, expectedState }) => {
        it(`should toggle isExpanded from ${initialState} to ${expectedState}`, () => {
          // arrange
          const treeNodeState = new TreeNodeState();
          treeNodeState.commitTransaction(
            treeNodeState.beginTransaction().withExpansionState(initialState),
          );
          // act
          treeNodeState.toggleExpand();
          // assert
          expect(treeNodeState.current.isExpanded).to.equal(expectedState);
        });
      });
    });
    it('should emit changed event', () => {
      // arrange
      const treeNodeState = new TreeNodeState();
      let isNotified = false;
      treeNodeState.changed.on(() => {
        isNotified = true;
      });
      // act
      treeNodeState.toggleExpand();
      // assert
      expect(isNotified).to.equal(true);
    });
  });
});
