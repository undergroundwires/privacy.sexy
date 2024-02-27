import { describe, it, expect } from 'vitest';
import { type Ref, shallowRef } from 'vue';
import { UseNodeStateChangeAggregatorStub } from '@tests/unit/shared/Stubs/UseNodeStateChangeAggregatorStub';
import { TreeRootStub } from '@tests/unit/shared/Stubs/TreeRootStub';
import { useAutoUpdateParentCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/UseAutoUpdateParentCheckState';
import { TreeNodeStateDescriptorStub } from '@tests/unit/shared/Stubs/TreeNodeStateDescriptorStub';
import { TreeNodeCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/CheckState';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { HierarchyAccessStub } from '@tests/unit/shared/Stubs/HierarchyAccessStub';
import { NodeStateChangeEventArgsStub, createChangeEvent } from '@tests/unit/shared/Stubs/NodeStateChangeEventArgsStub';
import type { TreeRoot } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRoot';
import { TreeNodeStateAccessStub, createAccessStubsFromCheckStates } from '@tests/unit/shared/Stubs/TreeNodeStateAccessStub';

describe('useAutoUpdateParentCheckState', () => {
  it('registers change handler', () => {
    // arrange
    const aggregatorStub = new UseNodeStateChangeAggregatorStub();
    const builder = new UseAutoUpdateParentCheckStateBuilder()
      .withChangeAggregator(aggregatorStub);
    // act
    builder.call();
    // assert
    expect(aggregatorStub.callback).toBeTruthy();
  });
  it('aggregate changes on specified tree', () => {
    // arrange
    const expectedTreeRootRef = shallowRef(new TreeRootStub());
    const aggregatorStub = new UseNodeStateChangeAggregatorStub();
    const builder = new UseAutoUpdateParentCheckStateBuilder()
      .withChangeAggregator(aggregatorStub)
      .withTreeRootRef(expectedTreeRootRef);
    // act
    builder.call();
    // assert
    const actualTreeRootRef = aggregatorStub.treeRootRef;
    expect(actualTreeRootRef).to.equal(expectedTreeRootRef);
  });
  it('does not throw if node has no parent', () => {
    // arrange
    const aggregatorStub = new UseNodeStateChangeAggregatorStub();
    const changeEvent = new NodeStateChangeEventArgsStub()
      .withNode(
        new TreeNodeStub().withHierarchy(
          new HierarchyAccessStub().withParent(undefined),
        ),
      );
    const builder = new UseAutoUpdateParentCheckStateBuilder()
      .withChangeAggregator(aggregatorStub);
    // act
    builder.call();
    const act = () => aggregatorStub.notifyChange(changeEvent);
    // assert
    expect(act).to.not.throw();
  });
  describe('skips event handling', () => {
    const scenarios: ReadonlyArray<{
      readonly description: string,
      readonly parentState: TreeNodeCheckState,
      readonly newChildState: TreeNodeCheckState,
      readonly oldChildState: TreeNodeCheckState,
      readonly parentNodeChildrenStates: readonly TreeNodeCheckState[],
    }> = [
      {
        description: 'check state remains the same',
        parentState: TreeNodeCheckState.Checked,
        newChildState: TreeNodeCheckState.Checked,
        oldChildState: TreeNodeCheckState.Checked,
        parentNodeChildrenStates: [TreeNodeCheckState.Checked], // these states do not matter
      },
      {
        description: 'if parent node has same target state as children: Unchecked',
        parentState: TreeNodeCheckState.Unchecked,
        newChildState: TreeNodeCheckState.Unchecked,
        oldChildState: TreeNodeCheckState.Checked,
        parentNodeChildrenStates: [
          TreeNodeCheckState.Unchecked,
          TreeNodeCheckState.Unchecked,
        ],
      },
      {
        description: 'if parent node has same target state as children: Checked',
        parentState: TreeNodeCheckState.Checked,
        newChildState: TreeNodeCheckState.Checked,
        oldChildState: TreeNodeCheckState.Unchecked,
        parentNodeChildrenStates: [
          TreeNodeCheckState.Checked,
          TreeNodeCheckState.Checked,
        ],
      },
      {
        description: 'if parent node has same target state as children: Indeterminate',
        parentState: TreeNodeCheckState.Indeterminate,
        newChildState: TreeNodeCheckState.Indeterminate,
        oldChildState: TreeNodeCheckState.Unchecked,
        parentNodeChildrenStates: [
          TreeNodeCheckState.Indeterminate,
          TreeNodeCheckState.Indeterminate,
        ],
      },
    ];
    scenarios.forEach(({
      description, newChildState, oldChildState, parentState, parentNodeChildrenStates,
    }) => {
      it(description, () => {
        // arrange
        const parentStateStub = new TreeNodeStateAccessStub()
          .withCurrentCheckState(parentState);
        const aggregatorStub = new UseNodeStateChangeAggregatorStub();
        const builder = new UseAutoUpdateParentCheckStateBuilder()
          .withChangeAggregator(aggregatorStub);
        const changeEvent = createChangeEvent({
          oldState: new TreeNodeStateDescriptorStub().withCheckState(oldChildState),
          newState: new TreeNodeStateDescriptorStub().withCheckState(newChildState),
          hierarchyBuilder: (hierarchy) => hierarchy.withParent(
            new TreeNodeStub()
              .withState(parentStateStub)
              .withHierarchy(
                new HierarchyAccessStub().withChildren(TreeNodeStub.fromStates(
                  createAccessStubsFromCheckStates(parentNodeChildrenStates),
                )),
              ),
          ),
        });
        // act
        builder.call();
        aggregatorStub.notifyChange(changeEvent);
        // assert
        expect(parentStateStub.isStateModificationRequested).to.equal(false);
      });
    });
  });
  describe('updates parent check state based on children', () => {
    const scenarios: ReadonlyArray<{
      readonly description: string;
      readonly parentNodeChildrenStates: readonly TreeNodeCheckState[];
      readonly expectedParentState: TreeNodeCheckState;
    }> = [
      {
        description: 'all children checked → parent checked',
        parentNodeChildrenStates: [TreeNodeCheckState.Checked, TreeNodeCheckState.Checked],
        expectedParentState: TreeNodeCheckState.Checked,
      },
      {
        description: 'all children unchecked → parent unchecked',
        parentNodeChildrenStates: [TreeNodeCheckState.Unchecked, TreeNodeCheckState.Unchecked],
        expectedParentState: TreeNodeCheckState.Unchecked,
      },
      {
        description: 'mixed children states → parent indeterminate',
        parentNodeChildrenStates: [TreeNodeCheckState.Checked, TreeNodeCheckState.Unchecked],
        expectedParentState: TreeNodeCheckState.Indeterminate,
      },
    ];
    scenarios.forEach(({ description, parentNodeChildrenStates, expectedParentState }) => {
      it(description, () => {
        // arrange
        const aggregatorStub = new UseNodeStateChangeAggregatorStub();
        const parentStateStub = new TreeNodeStateAccessStub()
          .withCurrentCheckState(TreeNodeCheckState.Unchecked);
        const changeEvent = createChangeEvent({
          oldState: new TreeNodeStateDescriptorStub().withCheckState(TreeNodeCheckState.Unchecked),
          newState: new TreeNodeStateDescriptorStub().withCheckState(TreeNodeCheckState.Checked),
          hierarchyBuilder: (hierarchy) => hierarchy.withParent(
            new TreeNodeStub()
              .withState(parentStateStub)
              .withHierarchy(
                new HierarchyAccessStub().withChildren(TreeNodeStub.fromStates(
                  createAccessStubsFromCheckStates(parentNodeChildrenStates),
                )),
              ),
          ),
        });
        const builder = new UseAutoUpdateParentCheckStateBuilder()
          .withChangeAggregator(aggregatorStub);
        // act
        builder.call();
        aggregatorStub.notifyChange(changeEvent);
        // assert
        expect(parentStateStub.current.checkState).to.equal(expectedParentState);
      });
    });
  });
});

class UseAutoUpdateParentCheckStateBuilder {
  private changeAggregator = new UseNodeStateChangeAggregatorStub();

  private treeRootRef: Readonly<Ref<TreeRoot>> = shallowRef(new TreeRootStub());

  public withChangeAggregator(changeAggregator: UseNodeStateChangeAggregatorStub): this {
    this.changeAggregator = changeAggregator;
    return this;
  }

  public withTreeRootRef(treeRootRef: Readonly<Ref<TreeRoot>>): this {
    this.treeRootRef = treeRootRef;
    return this;
  }

  public call(): ReturnType<typeof useAutoUpdateParentCheckState> {
    return useAutoUpdateParentCheckState(
      this.treeRootRef,
      this.changeAggregator.get(),
    );
  }
}
