import { describe, it, expect } from 'vitest';
import {
  ILiquorTreeExistingNode, ILiquorTreeNewNode, ILiquorTreeNodeData, ICustomLiquorTreeData,
} from 'liquor-tree';
import { NodeType, INodeContent } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/Node/INodeContent';
import { convertExistingToNode, toNewLiquorTreeNode } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/LiquorTree/NodeWrapper/NodeTranslator';

describe('NodeTranslator', () => {
  it('convertExistingToNode', () => {
    // arrange
    const existingNode = getExistingNode();
    const expected = getNode();
    // act
    const actual = convertExistingToNode(existingNode);
    // assert
    expect(actual).to.deep.equal(expected);
  });
  it('toNewLiquorTreeNode', () => {
    // arrange
    const node = getNode();
    const expected = getNewNode();
    // act
    const actual = toNewLiquorTreeNode(node);
    // assert
    expect(actual).to.deep.equal(expected);
  });
});

function getNode(): INodeContent {
  return {
    id: '1',
    text: 'parentcategory',
    isReversible: true,
    type: NodeType.Category,
    docs: ['parentcategory-doc1', 'parentcategory-doc2'],
    children: [
      {
        id: '2',
        text: 'subcategory',
        isReversible: true,
        docs: ['subcategory-doc1', 'subcategory-doc2'],
        type: NodeType.Category,
        children: [
          {
            id: 'script1',
            text: 'cool script 1',
            isReversible: true,
            docs: ['script1-doc1', 'script1-doc2'],
            children: [],
            type: NodeType.Script,
          },
          {
            id: 'script2',
            text: 'cool script 2',
            isReversible: true,
            docs: ['script2-doc1', 'script2-doc2'],
            children: [],
            type: NodeType.Script,
          }],
      }],
  };
}

function getExpectedExistingNodeData(node: INodeContent): ILiquorTreeNodeData {
  return {
    text: node.text,
    type: node.type,
    docs: node.docs,
    isReversible: node.isReversible,
  };
}

function getExpectedNewNodeData(node: INodeContent): ICustomLiquorTreeData {
  return {
    type: node.type,
    docs: node.docs,
    isReversible: node.isReversible,
  };
}

function getExistingNode(): ILiquorTreeExistingNode {
  const base = getNode();
  return {
    id: base.id,
    data: getExpectedExistingNodeData(base),
    states: undefined,
    children: [
      {
        id: base.children[0].id,
        data: getExpectedExistingNodeData(base.children[0]),
        states: undefined,
        children: [
          {
            id: base.children[0].children[0].id,
            data: getExpectedExistingNodeData(base.children[0].children[0]),
            states: undefined,
            children: [],
          },
          {
            id: base.children[0].children[1].id,
            data: getExpectedExistingNodeData(base.children[0].children[1]),
            states: undefined,
            children: [],
          }],
      }],
  };
}

function getNewNode(): ILiquorTreeNewNode {
  const base = getNode();
  const commonState = {
    checked: false,
    indeterminate: false,
  };
  return {
    id: base.id,
    text: base.text,
    data: getExpectedNewNodeData(base),
    state: commonState,
    children: [
      {
        id: base.children[0].id,
        text: base.children[0].text,
        data: getExpectedNewNodeData(base.children[0]),
        state: commonState,
        children: [
          {
            id: base.children[0].children[0].id,
            text: base.children[0].children[0].text,
            data: getExpectedNewNodeData(base.children[0].children[0]),
            state: commonState,
            children: [],
          },
          {
            id: base.children[0].children[1].id,
            text: base.children[0].children[1].text,
            data: getExpectedNewNodeData(base.children[0].children[1]),
            state: commonState,
            children: [],
          }],
      }],
  };
}
