import { describe, it, expect } from 'vitest';
import { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { CollapseDepthOrderer } from '@/presentation/components/Scripts/View/Tree/TreeView/Rendering/Ordering/CollapseDepthOrderer';
import { HierarchyAccessStub } from '@tests/unit/shared/Stubs/HierarchyAccessStub';
import { TreeNodeStateAccessStub } from '@tests/unit/shared/Stubs/TreeNodeStateAccessStub';
import { TreeNodeStateDescriptorStub } from '@tests/unit/shared/Stubs/TreeNodeStateDescriptorStub';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';

describe('CollapseDepthOrderer', () => {
  describe('orderNodes', () => {
    it('should order by collapsed state and then by depth in', () => {
      // arrange
      const node1 = createNodeForOrder({
        isExpanded: false,
        depthInTree: 1,
      });
      const node2 = createNodeForOrder({
        isExpanded: true,
        depthInTree: 2,
      });
      const node3 = createNodeForOrder({
        isExpanded: false,
        depthInTree: 3,
      });
      const node4 = createNodeForOrder({
        isExpanded: false,
        depthInTree: 4,
      });
      const nodes = [node1, node2, node3, node4];
      const expectedOrder = [node2, node1, node3, node4];
      // act
      const orderer = new CollapseDepthOrderer();
      const orderedNodes = orderer.orderNodes(nodes);
      // assert
      expect(orderedNodes.map((node) => node.id)).to.deep
        .equal(expectedOrder.map((node) => node.id));
    });
    it('should handle parent collapsed state', () => {
      // arrange
      const collapsedParent = createNodeForOrder({
        isExpanded: false,
        depthInTree: 0,
      });
      const childWithCollapsedParent = createNodeForOrder({
        isExpanded: true,
        depthInTree: 1,
        parent: collapsedParent,
      });
      const deepExpandedNode = createNodeForOrder({
        isExpanded: true,
        depthInTree: 3,
      });
      const nodes = [childWithCollapsedParent, collapsedParent, deepExpandedNode];
      const expectedOrder = [
        deepExpandedNode, // comes first due to collapse parent of child
        collapsedParent,
        childWithCollapsedParent,
      ];
      // act
      const orderer = new CollapseDepthOrderer();
      const orderedNodes = orderer.orderNodes(nodes);
      // assert
      expect(orderedNodes.map((node) => node.id)).to.deep
        .equal(expectedOrder.map((node) => node.id));
    });
  });
});

function createNodeForOrder(options: {
  readonly isExpanded: boolean;
  readonly depthInTree: number;
  readonly parent?: TreeNode;
}): TreeNode {
  return new TreeNodeStub()
    .withId([
      `isExpanded: ${options.isExpanded}`,
      `depthInTree: ${options.depthInTree}`,
      ...(options.parent ? [`parent: ${options.parent.id}`] : []),
    ].join(', '))
    .withState(
      new TreeNodeStateAccessStub()
        .withCurrent(
          new TreeNodeStateDescriptorStub()
            .withVisibility(true)
            .withExpansion(options.isExpanded),
        ),
    )
    .withHierarchy(
      new HierarchyAccessStub()
        .withDepthInTree(options.depthInTree)
        .withParent(options.parent),
    );
}
