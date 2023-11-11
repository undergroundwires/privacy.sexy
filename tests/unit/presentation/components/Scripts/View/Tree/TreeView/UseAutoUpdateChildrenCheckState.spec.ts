import { describe, it, expect } from 'vitest';
import { type Ref, shallowRef } from 'vue';
import { TreeRoot } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRoot';
import { useAutoUpdateChildrenCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/UseAutoUpdateChildrenCheckState';
import { TreeNodeCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/CheckState';
import { UseNodeStateChangeAggregatorStub } from '@tests/unit/shared/Stubs/UseNodeStateChangeAggregatorStub';
import { getAbsentObjectTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { TreeRootStub } from '@tests/unit/shared/Stubs/TreeRootStub';
import { TreeNodeStateDescriptorStub } from '@tests/unit/shared/Stubs/TreeNodeStateDescriptorStub';
import { TreeNodeStateAccessStub, createAccessStubsFromCheckStates } from '@tests/unit/shared/Stubs/TreeNodeStateAccessStub';
import { TreeNodeStateDescriptor } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateDescriptor';
import { createChangeEvent } from '@tests/unit/shared/Stubs/NodeStateChangeEventArgsStub';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';

describe('useAutoUpdateChildrenCheckState', () => {
  it('registers change handler', () => {
    // arrange
    const aggregatorStub = new UseNodeStateChangeAggregatorStub();
    const builder = new UseAutoUpdateChildrenCheckStateBuilder()
      .withChangeAggregator(aggregatorStub);
    // act
    builder.call();
    // assert
    expect(aggregatorStub.callback).toBeTruthy();
  });
  it('aggregate changes on specified tree', () => {
    // arrange
    const expectedTreeRoot = shallowRef(new TreeRootStub());
    const aggregatorStub = new UseNodeStateChangeAggregatorStub();
    const builder = new UseAutoUpdateChildrenCheckStateBuilder()
      .withChangeAggregator(aggregatorStub)
      .withTreeRoot(expectedTreeRoot);
    // act
    builder.call();
    // assert
    const actualTreeRoot = aggregatorStub.treeRootRef;
    expect(actualTreeRoot).to.equal(expectedTreeRoot);
  });
  describe('skips event handling', () => {
    const scenarios: ReadonlyArray<{
      readonly description: string,
      readonly oldState: TreeNodeCheckState,
      readonly newState: TreeNodeCheckState,
      readonly childrenStates: readonly TreeNodeStateAccessStub[],
      readonly isLeafNode: boolean,
    }> = [
      {
        description: 'remains same: unchecked → unchecked',
        oldState: TreeNodeCheckState.Unchecked,
        newState: TreeNodeCheckState.Unchecked,
        childrenStates: getAllPossibleCheckStates(),
        isLeafNode: false,
      },
      {
        description: 'remains same: checked → checked',
        oldState: TreeNodeCheckState.Checked,
        newState: TreeNodeCheckState.Checked,
        childrenStates: getAllPossibleCheckStates(),
        isLeafNode: false,
      },
      {
        description: 'to indeterminate: checked → indeterminate',
        oldState: TreeNodeCheckState.Checked,
        newState: TreeNodeCheckState.Indeterminate,
        childrenStates: getAllPossibleCheckStates(),
        isLeafNode: false,
      },
      {
        description: 'to indeterminate: unchecked → indeterminate',
        oldState: TreeNodeCheckState.Unchecked,
        newState: TreeNodeCheckState.Indeterminate,
        childrenStates: getAllPossibleCheckStates(),
        isLeafNode: false,
      },
      {
        description: 'parent is leaf node: checked → unchecked',
        oldState: TreeNodeCheckState.Checked,
        newState: TreeNodeCheckState.Indeterminate,
        childrenStates: getAllPossibleCheckStates(),
        isLeafNode: true,
      },
      {
        description: 'child node\'s state remains unchanged: unchecked → checked',
        oldState: TreeNodeCheckState.Unchecked,
        newState: TreeNodeCheckState.Checked,
        childrenStates: createAccessStubsFromCheckStates([
          TreeNodeCheckState.Checked,
          TreeNodeCheckState.Checked,
        ]),
        isLeafNode: false,
      },
      {
        description: 'child node\'s state remains unchanged: checked → unchecked',
        oldState: TreeNodeCheckState.Checked,
        newState: TreeNodeCheckState.Unchecked,
        childrenStates: createAccessStubsFromCheckStates([
          TreeNodeCheckState.Unchecked,
          TreeNodeCheckState.Unchecked,
        ]),
        isLeafNode: false,
      },
    ];
    scenarios.forEach(({
      description, newState, oldState, childrenStates, isLeafNode,
    }) => {
      it(description, () => {
        // arrange
        const aggregatorStub = new UseNodeStateChangeAggregatorStub();
        const builder = new UseAutoUpdateChildrenCheckStateBuilder()
          .withChangeAggregator(aggregatorStub);
        const changeEvent = createChangeEvent({
          oldState: new TreeNodeStateDescriptorStub().withCheckState(oldState),
          newState: new TreeNodeStateDescriptorStub().withCheckState(newState),
          hierarchyBuilder: (hierarchy) => hierarchy
            .withIsLeafNode(isLeafNode)
            .withChildren(TreeNodeStub.fromStates(childrenStates)),
        });
        // act
        builder.call();
        aggregatorStub.notifyChange(changeEvent);
        // assert
        const changedStates = childrenStates
          .filter((stub) => stub.isStateModificationRequested);
        expect(changedStates).to.have.lengthOf(0);
      });
    });
  });
  describe('updates children as expected', () => {
    const scenarios: ReadonlyArray<{
      readonly description: string;
      readonly oldState?: TreeNodeStateDescriptor;
      readonly newState: TreeNodeStateDescriptor;
    }> = [
      {
        description: 'unchecked → checked',
        oldState: new TreeNodeStateDescriptorStub().withCheckState(TreeNodeCheckState.Unchecked),
        newState: new TreeNodeStateDescriptorStub().withCheckState(TreeNodeCheckState.Checked),
      },
      {
        description: 'checked → unchecked',
        oldState: new TreeNodeStateDescriptorStub().withCheckState(TreeNodeCheckState.Checked),
        newState: new TreeNodeStateDescriptorStub().withCheckState(TreeNodeCheckState.Unchecked),
      },
      {
        description: 'indeterminate → unchecked',
        oldState: new TreeNodeStateDescriptorStub()
          .withCheckState(TreeNodeCheckState.Indeterminate),
        newState: new TreeNodeStateDescriptorStub().withCheckState(TreeNodeCheckState.Unchecked),
      },
      {
        description: 'indeterminate → checked',
        oldState: new TreeNodeStateDescriptorStub()
          .withCheckState(TreeNodeCheckState.Indeterminate),
        newState: new TreeNodeStateDescriptorStub().withCheckState(TreeNodeCheckState.Checked),
      },
      ...getAbsentObjectTestCases().map((testCase) => ({
        description: `absent old state: "${testCase.valueName}"`,
        oldState: testCase.absentValue,
        newState: new TreeNodeStateDescriptorStub().withCheckState(TreeNodeCheckState.Unchecked),
      })),
    ];
    scenarios.forEach(({ description, newState, oldState }) => {
      it(description, () => {
        // arrange
        const aggregatorStub = new UseNodeStateChangeAggregatorStub();
        const childrenStates = getAllPossibleCheckStates();
        const expectedChildrenStates = childrenStates.map(() => newState.checkState);
        const builder = new UseAutoUpdateChildrenCheckStateBuilder()
          .withChangeAggregator(aggregatorStub);
        const changeEvent = createChangeEvent({
          oldState,
          newState,
          hierarchyBuilder: (hierarchy) => hierarchy
            .withIsLeafNode(false)
            .withChildren(TreeNodeStub.fromStates(childrenStates)),
        });
        // act
        builder.call();
        aggregatorStub.notifyChange(changeEvent);
        // assert
        const actualStates = childrenStates.map((state) => state.current.checkState);
        expect(actualStates).to.have.lengthOf(expectedChildrenStates.length);
        expect(actualStates).to.have.members(expectedChildrenStates);
      });
    });
  });
});

function getAllPossibleCheckStates() {
  return createAccessStubsFromCheckStates([
    TreeNodeCheckState.Checked,
    TreeNodeCheckState.Unchecked,
    TreeNodeCheckState.Indeterminate,
  ]);
}

class UseAutoUpdateChildrenCheckStateBuilder {
  private changeAggregator = new UseNodeStateChangeAggregatorStub();

  private treeRoot: Readonly<Ref<TreeRoot>> = shallowRef(new TreeRootStub());

  public withChangeAggregator(changeAggregator: UseNodeStateChangeAggregatorStub): this {
    this.changeAggregator = changeAggregator;
    return this;
  }

  public withTreeRoot(treeRoot: Readonly<Ref<TreeRoot>>): this {
    this.treeRoot = treeRoot;
    return this;
  }

  public call(): ReturnType<typeof useAutoUpdateChildrenCheckState> {
    return useAutoUpdateChildrenCheckState(
      this.treeRoot,
      this.changeAggregator.get(),
    );
  }
}
