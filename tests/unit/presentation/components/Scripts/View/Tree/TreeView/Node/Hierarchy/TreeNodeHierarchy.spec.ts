import { describe, it, expect } from 'vitest';
import { TreeNodeHierarchy } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/Hierarchy/TreeNodeHierarchy';
import { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { HierarchyAccessStub } from '@tests/unit/shared/Stubs/HierarchyAccessStub';

describe('TreeNodeHierarchy', () => {
  describe('setChildren', () => {
    it('sets the provided children correctly', () => {
      // arrange
      const hierarchy = new TreeNodeHierarchy();
      const expectedChildren = [new TreeNodeStub(), new TreeNodeStub()];
      // act
      hierarchy.setChildren(expectedChildren);
      // assert
      expect(hierarchy.children).to.deep.equal(expectedChildren);
    });
  });

  describe('setParent', () => {
    it('sets the provided children correctly', () => {
      // arrange
      const hierarchy = new TreeNodeHierarchy();
      const expectedParent = new TreeNodeStub();
      // act
      hierarchy.setParent(expectedParent);
      // assert
      expect(hierarchy.parent).to.deep.equal(expectedParent);
    });
  });

  describe('isLeafNode', () => {
    it('returns `true` without children', () => {
      // arrange
      const hierarchy = new TreeNodeHierarchy();
      const children = [];
      // act
      hierarchy.setChildren(children);
      // assert
      expect(hierarchy.isLeafNode).to.equal(true);
    });

    it('returns `false` with children', () => {
      // arrange
      const hierarchy = new TreeNodeHierarchy();
      const children = [new TreeNodeStub()];
      // act
      hierarchy.setChildren(children);
      // assert
      expect(hierarchy.isLeafNode).to.equal(false);
    });
  });

  describe('isBranchNode', () => {
    it('returns `false` without children', () => {
      // arrange
      const hierarchy = new TreeNodeHierarchy();
      const children = [];
      // act
      hierarchy.setChildren(children);
      // assert
      expect(hierarchy.isBranchNode).to.equal(false);
    });

    it('returns `true` with children', () => {
      // arrange
      const hierarchy = new TreeNodeHierarchy();
      const children = [new TreeNodeStub()];
      // act
      hierarchy.setChildren(children);
      // assert
      expect(hierarchy.isBranchNode).to.equal(true);
    });
  });

  describe('depthInTree', () => {
    interface DepthTestScenario {
      readonly parentNode: TreeNode | undefined,
      readonly expectedDepth: number;
    }
    const testCases: readonly DepthTestScenario[] = [
      {
        parentNode: undefined,
        expectedDepth: 0,
      },
      {
        parentNode: new TreeNodeStub()
          .withHierarchy(
            new HierarchyAccessStub()
              .withDepthInTree(0)
              .withParent(undefined),
          ),
        expectedDepth: 1,
      },
      {
        parentNode: new TreeNodeStub().withHierarchy(
          new HierarchyAccessStub()
            .withDepthInTree(1)
            .withParent(new TreeNodeStub()),
        ),
        expectedDepth: 2,
      },
    ];
    testCases.forEach(({ parentNode, expectedDepth }) => {
      it(`when depth is expected to be ${expectedDepth}`, () => {
        // arrange
        const hierarchy = new TreeNodeHierarchy();
        // act
        hierarchy.setParent(parentNode);
        // assert
        expect(hierarchy.depthInTree).to.equal(expectedDepth);
      });
    });
  });
});
