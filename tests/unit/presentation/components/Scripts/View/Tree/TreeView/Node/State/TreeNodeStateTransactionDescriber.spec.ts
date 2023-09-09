import { describe, it, expect } from 'vitest';
import { TreeNodeStateTransactionDescriber } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/TreeNodeStateTransactionDescriber';
import { TreeNodeStateDescriptor } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateDescriptor';
import { PropertyKeys } from '@/TypeHelpers';
import { TreeNodeStateTransaction } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateAccess';
import { TreeNodeCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/CheckState';

describe('TreeNodeStateTransactionDescriber', () => {
  describe('sets state as expected', () => {
    const testScenarios: {
      readonly [K in PropertyKeys<TreeNodeStateDescriptor>]: {
        readonly applyStateChange: (
          describer: TreeNodeStateTransaction,
        ) => TreeNodeStateTransaction,
        readonly extractStateValue: (descriptor: Partial<TreeNodeStateDescriptor>) => unknown,
        readonly expectedValue: unknown,
      }
    } = {
      checkState: {
        applyStateChange: (describer) => describer.withCheckState(TreeNodeCheckState.Indeterminate),
        extractStateValue: (descriptor) => descriptor.checkState,
        expectedValue: TreeNodeCheckState.Indeterminate,
      },
      isExpanded: {
        applyStateChange: (describer) => describer.withExpansionState(true),
        extractStateValue: (descriptor) => descriptor.isExpanded,
        expectedValue: true,
      },
      isVisible: {
        applyStateChange: (describer) => describer.withVisibilityState(true),
        extractStateValue: (descriptor) => descriptor.isVisible,
        expectedValue: true,
      },
      isMatched: {
        applyStateChange: (describer) => describer.withMatchState(true),
        extractStateValue: (descriptor) => descriptor.isMatched,
        expectedValue: true,
      },
      isFocused: {
        applyStateChange: (describer) => describer.withFocusState(true),
        extractStateValue: (descriptor) => descriptor.isFocused,
        expectedValue: true,
      },
    };
    describe('sets single state as expected', () => {
      Object.entries(testScenarios).forEach(([stateKey, {
        applyStateChange, extractStateValue, expectedValue,
      }]) => {
        it(stateKey, () => {
          // arrange
          let describer: TreeNodeStateTransaction = new TreeNodeStateTransactionDescriber();
          // act
          describer = applyStateChange(describer);
          // assert
          const actualValue = extractStateValue(describer.updatedState);
          expect(actualValue).to.equal(expectedValue);
        });
      });
    });
    it('chains multiple state setters correctly', () => {
      // arrange
      let describer: TreeNodeStateTransaction = new TreeNodeStateTransactionDescriber();
      // act
      Object.values(testScenarios).forEach(({ applyStateChange }) => {
        describer = applyStateChange(describer);
      });
      // assert
      Object.values(testScenarios).forEach(({ extractStateValue, expectedValue }) => {
        const actualValue = extractStateValue(describer.updatedState);
        expect(actualValue).to.equal(expectedValue);
      });
    });
  });
});
