import 'mocha';
import { expect } from 'chai';
import {
  ILiquorTreeExistingNode, ILiquorTreeNewNode, ILiquorTreeNodeData, ICustomLiquorTreeData,
} from 'liquor-tree';
import { NodeType, INode } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/Node/INode';
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

function getNode(): INode {
  return {
    id: '1',
    text: 'parentcategory',
    isReversible: true,
    type: NodeType.Category,
    documentationUrls: ['parentcategory-url1', 'parentcategory-url2'],
    children: [
      {
        id: '2',
        text: 'subcategory',
        isReversible: true,
        documentationUrls: ['subcategory-url1', 'subcategory-url2'],
        type: NodeType.Category,
        children: [
          {
            id: 'script1',
            text: 'cool script 1',
            isReversible: true,
            documentationUrls: ['script1url1', 'script1url2'],
            children: [],
            type: NodeType.Script,
          },
          {
            id: 'script2',
            text: 'cool script 2',
            isReversible: true,
            documentationUrls: ['script2url1', 'script2url2'],
            children: [],
            type: NodeType.Script,
          }],
      }],
  };
}

function getExpectedExistingNodeData(node: INode): ILiquorTreeNodeData {
  return {
    text: node.text,
    type: node.type,
    documentationUrls: node.documentationUrls,
    isReversible: node.isReversible,
  };
}

function getExpectedNewNodeData(node: INode): ICustomLiquorTreeData {
  return {
    type: node.type,
    documentationUrls: node.documentationUrls,
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
