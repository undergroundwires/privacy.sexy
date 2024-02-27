import { describe, it, expect } from 'vitest';
import { parseTreeInput } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/TreeInputParser';
import type { TreeInputNodeData } from '@/presentation/components/Scripts/View/Tree/TreeView/Bindings/TreeInputNodeData';
import { TreeNodeManager } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNodeManager';
import { TreeInputNodeDataStub } from '@tests/unit/shared/Stubs/TreeInputNodeDataStub';

describe('parseTreeInput', () => {
  it('throws if input data is not an array', () => {
    // arrange
    const expectedError = 'input data must be an array';
    const invalidInput = 'invalid-input' as unknown as TreeInputNodeData[];
    // act
    const act = () => parseTreeInput(invalidInput);
    // assert
    expect(act).to.throw(expectedError);
  });

  it('returns an empty array if given an empty array', () => {
    // arrange
    const input = [];
    // act
    const nodes = parseTreeInput(input);
    // assert
    expect(nodes).to.have.lengthOf(0);
  });

  it(`creates ${TreeNodeManager.name} for each node`, () => {
    // arrange
    const input: TreeInputNodeData[] = [
      new TreeInputNodeDataStub(),
      new TreeInputNodeDataStub(),
    ];
    // act
    const nodes = parseTreeInput(input);
    // assert
    expect(nodes).have.lengthOf(2);
    expect(nodes[0]).to.be.instanceOf(TreeNodeManager);
    expect(nodes[1]).to.be.instanceOf(TreeNodeManager);
  });

  it('converts flat input array to flat node array', () => {
    // arrange
    const inputNodes: TreeInputNodeData[] = [
      new TreeInputNodeDataStub().withId('1'),
      new TreeInputNodeDataStub().withId('2'),
    ];
    // act
    const nodes = parseTreeInput(inputNodes);
    // assert
    expect(nodes).have.lengthOf(2);
    expect(nodes[0].id).equal(inputNodes[0].id);
    expect(nodes[0].hierarchy.children).to.have.lengthOf(0);
    expect(nodes[0].hierarchy.parent).to.toBeUndefined();
    expect(nodes[1].id).equal(inputNodes[1].id);
    expect(nodes[1].hierarchy.children).to.have.lengthOf(0);
    expect(nodes[1].hierarchy.parent).to.toBeUndefined();
  });

  it('correctly parses nested data with correct hierarchy', () => {
    // arrange;
    const grandChildData = new TreeInputNodeDataStub().withId('1-1-1');
    const childData = new TreeInputNodeDataStub().withId('1-1').withChildren([grandChildData]);
    const parentNodeData = new TreeInputNodeDataStub().withId('1').withChildren([childData]);
    const inputData: TreeInputNodeData[] = [parentNodeData];

    // act
    const nodes = parseTreeInput(inputData);

    // assert
    expect(nodes).to.have.lengthOf(1);
    expect(nodes[0].id).to.equal(parentNodeData.id);
    expect(nodes[0].hierarchy.children).to.have.lengthOf(1);

    const childNode = nodes[0].hierarchy.children[0];
    expect(childNode.id).to.equal(childData.id);
    expect(childNode.hierarchy.children).to.have.lengthOf(1);
    expect(childNode.hierarchy.parent).to.equal(nodes[0]);

    const grandChildNode = childNode.hierarchy.children[0];
    expect(grandChildNode.id).to.equal(grandChildData.id);
    expect(grandChildNode.hierarchy.children).to.have.lengthOf(0);
    expect(grandChildNode.hierarchy.parent).to.equal(childNode);
  });
});
