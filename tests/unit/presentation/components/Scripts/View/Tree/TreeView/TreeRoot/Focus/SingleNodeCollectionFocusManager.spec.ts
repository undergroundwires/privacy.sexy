import { expect, describe, it } from 'vitest';
import { SingleNodeCollectionFocusManager } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/Focus/SingleNodeCollectionFocusManager';
import { TreeNodeCollectionStub } from '@tests/unit/shared/Stubs/TreeNodeCollectionStub';
import { QueryableNodesStub } from '@tests/unit/shared/Stubs/QueryableNodesStub';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { TreeNodeStateAccessStub } from '@tests/unit/shared/Stubs/TreeNodeStateAccessStub';
import { TreeNodeStateDescriptorStub } from '@tests/unit/shared/Stubs/TreeNodeStateDescriptorStub';
import type { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';

describe('SingleNodeCollectionFocusManager', () => {
  describe('currentSingleFocusedNode', () => {
    const testCases: ReadonlyArray<{
      readonly name: string,
      readonly nodes: TreeNode[],
      readonly expectedValue: TreeNode | undefined,
    }> = [
      {
        name: 'should return undefined if no node is focused',
        nodes: [],
        expectedValue: undefined,
      },
      (() => {
        const unfocusedNode = getNodeWithFocusState(false);
        const focusedNode = getNodeWithFocusState(true);
        return {
          name: 'should return the single focused node',
          nodes: [focusedNode, unfocusedNode],
          expectedValue: focusedNode,
        };
      })(),
      {
        name: 'should return undefined if multiple nodes are focused',
        nodes: [getNodeWithFocusState(true), getNodeWithFocusState(true)],
        expectedValue: undefined,
      },
    ];
    testCases.forEach(({ name, nodes, expectedValue }) => {
      it(name, () => {
        // arrange
        const collection = new TreeNodeCollectionStub()
          .withNodes(new QueryableNodesStub().withFlattenedNodes(nodes));
        const focusManager = new SingleNodeCollectionFocusManager(collection);
        // act
        const singleFocusedNode = focusManager.currentSingleFocusedNode;
        // assert
        expect(singleFocusedNode).to.equal(expectedValue);
      });
    });
  });

  describe('setSingleFocus', () => {
    it('should set focus on given node and remove focus from all others', () => {
      // arrange
      const node1 = getNodeWithFocusState(true);
      const node2 = getNodeWithFocusState(true);
      const node3 = getNodeWithFocusState(false);
      const collection = new TreeNodeCollectionStub()
        .withNodes(new QueryableNodesStub().withFlattenedNodes([node1, node2, node3]));
      // act
      const focusManager = new SingleNodeCollectionFocusManager(collection);
      focusManager.setSingleFocus(node3);
      // assert
      expect(node1.state.current.isFocused).toBeFalsy();
      expect(node2.state.current.isFocused).toBeFalsy();
      expect(node3.state.current.isFocused).toBeTruthy();
    });
    it('should set currentSingleFocusedNode as expected', () => {
      // arrange
      const nodeToFocus = getNodeWithFocusState(false);
      const collection = new TreeNodeCollectionStub()
        .withNodes(new QueryableNodesStub().withFlattenedNodes([
          getNodeWithFocusState(false),
          getNodeWithFocusState(true),
          nodeToFocus,
          getNodeWithFocusState(false),
          getNodeWithFocusState(true),
        ]));
      // act
      const focusManager = new SingleNodeCollectionFocusManager(collection);
      focusManager.setSingleFocus(nodeToFocus);
      // assert
      expect(focusManager.currentSingleFocusedNode).toEqual(nodeToFocus);
    });
  });
});

function getNodeWithFocusState(isFocused: boolean): TreeNodeStub {
  return new TreeNodeStub()
    .withState(new TreeNodeStateAccessStub().withCurrent(
      new TreeNodeStateDescriptorStub().withFocus(isFocused),
    ));
}
