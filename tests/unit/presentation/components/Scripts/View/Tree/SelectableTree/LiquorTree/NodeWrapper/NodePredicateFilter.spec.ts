import { describe, it, expect } from 'vitest';
import { ILiquorTreeExistingNode } from 'liquor-tree';
import { NodeType, INodeContent } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/Node/INodeContent';
import { NodePredicateFilter } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/LiquorTree/NodeWrapper/NodePredicateFilter';

describe('NodePredicateFilter', () => {
  it('calls predicate with expected node', () => {
    // arrange
    const object: ILiquorTreeExistingNode = {
      id: 'script',
      data: {
        text: 'script-text',
        type: NodeType.Script,
        docs: [],
        isReversible: false,
      },
      states: undefined,
      children: [],
    };
    const expected: INodeContent = {
      id: 'script',
      text: 'script-text',
      isReversible: false,
      docs: [],
      children: [],
      type: NodeType.Script,
    };
    let actual: INodeContent;
    const predicate = (node: INodeContent) => { actual = node; return true; };
    const sut = new NodePredicateFilter(predicate);
    // act
    sut.matcher('nop query', object);
    // assert
    expect(actual).to.deep.equal(expected);
  });
  describe('returns result from the predicate', () => {
    for (const expected of [false, true]) {
      it(expected.toString(), () => {
        // arrange
        const sut = new NodePredicateFilter(() => expected);
        // act
        const actual = sut.matcher('nop query', getExistingNode());
        // assert
        expect(actual).to.equal(expected);
      });
    }
  });
});

function getExistingNode(): ILiquorTreeExistingNode {
  return {
    id: 'script',
    data: {
      text: 'script-text',
      type: NodeType.Script,
      docs: [],
      isReversible: false,
    },
    states: undefined,
    children: [],
  };
}
