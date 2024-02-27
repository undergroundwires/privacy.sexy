import { describe, it, expect } from 'vitest';
import type { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { CollapsedParentOrderer } from '@/presentation/components/Scripts/View/Tree/TreeView/Rendering/Ordering/CollapsedParentOrderer';
import { HierarchyAccessStub } from '@tests/unit/shared/Stubs/HierarchyAccessStub';
import { TreeNodeStateAccessStub } from '@tests/unit/shared/Stubs/TreeNodeStateAccessStub';
import { TreeNodeStateDescriptorStub } from '@tests/unit/shared/Stubs/TreeNodeStateDescriptorStub';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';

describe('CollapsedParentOrderer', () => {
  describe('orderNodes', () => {
    const scenarios: ReadonlyArray<{
      readonly description: string;
      readonly nodes: TreeNode[];
      readonly expectedOrderedNodes: TreeNode[];
    }> = [
      {
        description: 'handles empty nodes list',
        nodes: [],
        expectedOrderedNodes: [],
      },
      (() => {
        const expectedNode = createNodeForOrder({
          isExpanded: false,
        });
        return {
          description: 'handles single node list',
          nodes: [expectedNode],
          expectedOrderedNodes: [expectedNode],
        };
      })(),
      (() => {
        const node1 = createNodeForOrder({
          isExpanded: false,
        });
        const node2 = createNodeForOrder({
          isExpanded: true,
        });
        const node3 = createNodeForOrder({
          isExpanded: true,
        });
        const node4 = createNodeForOrder({
          isExpanded: false,
        });
        return {
          description: 'orders by index ignoring self collapsed state',
          nodes: [node1, node2, node3, node4],
          expectedOrderedNodes: [node1, node2, node3, node4],
        };
      })(),
      (() => {
        const node1 = createNodeForOrder({
          isExpanded: false,
          parent: createNodeForOrder({ isExpanded: true }),
        });
        const node2 = createNodeForOrder({
          isExpanded: true,
          parent: createNodeForOrder({ isExpanded: true }),
        });
        const node3 = createNodeForOrder({
          isExpanded: true,
          parent: createNodeForOrder({ isExpanded: true }),
        });
        const node4 = createNodeForOrder({
          isExpanded: false,
          parent: createNodeForOrder({ isExpanded: true }),
        });
        return {
          description: 'orders by index if all parents are expanded',
          nodes: [node1, node2, node3, node4],
          expectedOrderedNodes: [node1, node2, node3, node4],
        };
      })(),
      (() => {
        const node1 = createNodeForOrder({
          isExpanded: true,
          parent: createNodeForOrder({ isExpanded: false }),
        });
        const node2 = createNodeForOrder({
          isExpanded: true,
          parent: createNodeForOrder({ isExpanded: true }),
        });
        const node3 = createNodeForOrder({
          isExpanded: true,
        });
        const node4 = createNodeForOrder({
          isExpanded: true,
          parent: createNodeForOrder({ isExpanded: false }),
        });
        return {
          description: 'order by parent collapsed state then by index',
          nodes: [node1, node2, node3, node4],
          expectedOrderedNodes: [node2, node3, node1, node4],
        };
      })(),
      (() => {
        const collapsedNode = createNodeForOrder({
          isExpanded: false,
        });
        const collapsedNodeChild = createNodeForOrder({
          isExpanded: true,
          parent: collapsedNode,
        });
        const collapsedNodeNestedChild = createNodeForOrder({
          isExpanded: true,
          parent: collapsedNodeChild,
        });
        const expandedNode = createNodeForOrder({
          isExpanded: true,
        });
        const expandedNodeChild = createNodeForOrder({
          isExpanded: true,
          parent: expandedNode,
        });
        const expandedNodeNestedChild = createNodeForOrder({
          isExpanded: true,
          parent: expandedNodeChild,
        });
        return {
          description: 'should handle deep parent collapsed state',
          nodes: [
            collapsedNode, collapsedNodeChild, collapsedNodeNestedChild,
            expandedNode, expandedNodeChild, expandedNodeNestedChild,
          ],
          expectedOrderedNodes: [
            collapsedNode, expandedNode, expandedNodeChild,
            expandedNodeNestedChild, collapsedNodeChild, collapsedNodeNestedChild,
          ],
        };
      })(),
    ];
    scenarios.forEach(({ description, nodes, expectedOrderedNodes }) => {
      it(description, () => {
        // act
        const orderer = new CollapsedParentOrderer();
        const orderedNodes = orderer.orderNodes(nodes);
        // assert
        expect(orderedNodes.map((node) => node.id)).to.deep
          .equal(expectedOrderedNodes.map((node) => node.id));
      });
    });
  });
});

function createNodeForOrder(options: {
  readonly isExpanded: boolean;
  readonly parent?: TreeNode;
}): TreeNode {
  return new TreeNodeStub()
    .withId([
      `isExpanded: ${options.isExpanded}`,
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
        .withParent(options.parent),
    );
}
