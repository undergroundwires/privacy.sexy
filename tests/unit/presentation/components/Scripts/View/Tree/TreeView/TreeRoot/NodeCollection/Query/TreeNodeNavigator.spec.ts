import { expect } from 'vitest';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { HierarchyAccessStub } from '@tests/unit/shared/Stubs/HierarchyAccessStub';
import { TreeNodeNavigator } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/Query/TreeNodeNavigator';
import { expectArrayEquals } from '@tests/shared/Assertions/ExpectArrayEquals';

describe('TreeNodeNavigator', () => {
  describe('flattenedNodes', () => {
    it('should flatten root nodes correctly', () => {
      // arrange
      const rootNode1 = new TreeNodeStub();
      const rootNode2 = new TreeNodeStub();
      const rootNode3 = new TreeNodeStub();
      const providedRootNodes = [rootNode1, rootNode2, rootNode3];
      // act
      const navigator = new TreeNodeNavigator(providedRootNodes);
      // assert
      const actualNodes = navigator.flattenedNodes;
      expectArrayEquals(actualNodes, providedRootNodes);
    });

    it('should flatten nested nodes correctly', () => {
      // arrange
      const nestedNode = new TreeNodeStub();
      const nestedNode2 = new TreeNodeStub();
      const rootNode = new TreeNodeStub()
        .withHierarchy(new HierarchyAccessStub().withChildren([nestedNode, nestedNode2]));
      // act
      const navigator = new TreeNodeNavigator([rootNode]);
      // assert
      const expectedNodes = [nestedNode, nestedNode2, rootNode];
      const actualNodes = navigator.flattenedNodes;
      expectArrayEquals(actualNodes, expectedNodes, {
        ignoreOrder: true,
      });
    });

    it('should flatten deeply nested nodes correctly', () => {
      // arrange
      const deepNestedNode1 = new TreeNodeStub();
      const deepNestedNode2 = new TreeNodeStub();
      const nestedNode = new TreeNodeStub()
        .withHierarchy(new HierarchyAccessStub().withChildren([deepNestedNode1, deepNestedNode2]));
      const rootNode = new TreeNodeStub()
        .withHierarchy(new HierarchyAccessStub().withChildren([nestedNode]));
      // act
      const navigator = new TreeNodeNavigator([rootNode]);
      // assert
      const expectedNodes = [
        rootNode, nestedNode, deepNestedNode1, deepNestedNode2,
      ];
      const actualNodes = navigator.flattenedNodes;
      expectArrayEquals(actualNodes, expectedNodes);
    });
  });

  describe('rootNodes', () => {
    it('should initialize with expected root nodes', () => {
      // arrange
      const nestedNode = new TreeNodeStub();
      const rootNode = new TreeNodeStub()
        .withHierarchy(new HierarchyAccessStub().withChildren([nestedNode]));
      // act
      const navigator = new TreeNodeNavigator([rootNode]);
      // assert
      const expectedRootNodes = [rootNode];
      const actualRootNodes = navigator.rootNodes;
      expectArrayEquals(actualRootNodes, expectedRootNodes);
    });
  });

  describe('getNodeById', () => {
    it('should find nested node by id', () => {
      // arrange
      const nodeId = 'nested-node-id';
      const expectedNode = new TreeNodeStub().withId(nodeId);
      const rootNode = new TreeNodeStub()
        .withHierarchy(new HierarchyAccessStub().withChildren([expectedNode]));
      const navigator = new TreeNodeNavigator([rootNode]);
      // act
      const actualNode = navigator.getNodeById(nodeId);
      // assert
      expect(actualNode).to.equal(expectedNode);
    });

    it('should find root node by id', () => {
      // arrange
      const nodeId = 'root-node-id';
      const expectedRootNode = new TreeNodeStub().withId(nodeId);
      const navigator = new TreeNodeNavigator([
        new TreeNodeStub(),
        expectedRootNode,
        new TreeNodeStub(),
      ]);
      // act
      const actualNode = navigator.getNodeById(nodeId);
      // assert
      expect(actualNode).to.equal(expectedRootNode);
    });

    it('should throw an error if node cannot be found', () => {
      // arrange
      const absentNodeId = 'absent-node-id';
      const expectedError = `Node could not be found: ${absentNodeId}`;
      const navigator = new TreeNodeNavigator([
        new TreeNodeStub(),
        new TreeNodeStub(),
      ]);
      // act
      const act = () => navigator.getNodeById(absentNodeId);
      // assert
      expect(act).to.throw(expectedError);
    });
  });
});
