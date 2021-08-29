import 'mocha';
import { expect } from 'chai';
import { ILiquorTreeNode } from 'liquor-tree';
import { NodeType } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/Node/INode';
import { getNewState } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/LiquorTree/NodeWrapper/NodeStateUpdater';

describe('NodeStateUpdater', () => {
    describe('getNewState', () => {
        describe('checked', () => {
            describe('script node', () => {
                it('true when selected', () => {
                    // arrange
                    const node = getScriptNode();
                    const selectedScriptNodeIds = [ 'a', 'b', node.id, 'c' ];
                    // act
                    const state = getNewState(node, selectedScriptNodeIds);
                    // assert
                    expect(state.checked).to.equal(true);
                });
                it('false when unselected', () => {
                    // arrange
                    const node = getScriptNode();
                    const selectedScriptNodeIds = [ 'a', 'b', 'c' ];
                    // act
                    const state = getNewState(node, selectedScriptNodeIds);
                    // assert
                    expect(state.checked).to.equal(false);
                });
            });
            describe('category node', () => {
                it('true when every child selected', () => {
                    // arrange
                    const node = {
                        id: '1',
                        data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                        children: [
                            {   id: '2',
                                data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                                children: [ getScriptNode('a'), getScriptNode('b') ],
                            },
                            {   id: '3',
                                data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                                children: [ getScriptNode('c') ],
                            },
                        ],
                    };
                    const selectedScriptNodeIds = [ 'a', 'b', 'c' ];
                    // act
                    const state = getNewState(node, selectedScriptNodeIds);
                    // assert
                    expect(state.checked).to.equal(true);
                });
                it('false when none of the children is selected', () => {
                    // arrange
                    const node = {
                        id: '1',
                        data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                        children: [
                            {   id: '2',
                                data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                                children: [ getScriptNode('a'), getScriptNode('b') ],
                            },
                            {   id: '3',
                                data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                                children: [ getScriptNode('c') ],
                            },
                        ],
                    };
                    const selectedScriptNodeIds = [ 'none', 'of', 'them', 'are', 'selected' ];
                    // act
                    const state = getNewState(node, selectedScriptNodeIds);
                    // assert
                    expect(state.checked).to.equal(false);
                });
                it('false when some of the children is selected', () => {
                    // arrange
                    const node = {
                        id: '1',
                        data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                        children: [
                            {
                                id: '2',
                                data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                                children: [ getScriptNode('a'), getScriptNode('b') ],
                            },
                            {
                                id: '3',
                                data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                                children: [ getScriptNode('c') ],
                            },
                        ],
                    };
                    const selectedScriptNodeIds = [ 'a', 'c', 'unrelated' ];
                    // act
                    const state = getNewState(node, selectedScriptNodeIds);
                    // assert
                    expect(state.checked).to.equal(false);
                });
            });
        });
        describe('indeterminate', () => {
            describe('script node', () => {
                it('false when selected', () => {
                    // arrange
                    const node = getScriptNode();
                    const selectedScriptNodeIds = [ 'a', 'b', node.id, 'c' ];
                    // act
                    const state = getNewState(node, selectedScriptNodeIds);
                    // assert
                    expect(state.indeterminate).to.equal(false);
                });
                it('false when not selected', () => {
                    // arrange
                    const node = getScriptNode();
                    const selectedScriptNodeIds = [ 'a', 'b', 'c' ];
                    // act
                    const state = getNewState(node, selectedScriptNodeIds);
                    // assert
                    expect(state.indeterminate).to.equal(false);
                });
            });
            describe('category node', () => {
                it('false when all children are selected', () => {
                    // arrange
                    const node = {
                        id: '1',
                        data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                        children: [
                            {   id: '2',
                                data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                                children: [ getScriptNode('a'), getScriptNode('b') ],
                            },
                            {   id: '3',
                                data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                                children: [ getScriptNode('c') ],
                            },
                        ],
                    };
                    const selectedScriptNodeIds = [ 'a', 'b', 'c' ];
                    // act
                    const state = getNewState(node, selectedScriptNodeIds);
                    // assert
                    expect(state.indeterminate).to.equal(false);
                });
                it('true when all some are selected', () => {
                    // arrange
                    const node = {
                        id: '1',
                        data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                        children: [
                            {   id: '2',
                                data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                                children: [ getScriptNode('a'), getScriptNode('b') ],
                            },
                            {   id: '3',
                                data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                                children: [ getScriptNode('c') ],
                            },
                        ],
                    };
                    const selectedScriptNodeIds = [ 'a' ];
                    // act
                    const state = getNewState(node, selectedScriptNodeIds);
                    // assert
                    expect(state.indeterminate).to.equal(true);
                });
                it('false when no children are selected', () => {
                    // arrange
                    const node = {
                        id: '1',
                        data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                        children: [
                            {   id: '2',
                                data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                                children: [ getScriptNode('a'), getScriptNode('b') ],
                            },
                            {   id: '3',
                                data: { type: NodeType.Category, documentationUrls: [], isReversible: false },
                                children: [ getScriptNode('c') ],
                            },
                        ],
                    };
                    const selectedScriptNodeIds = [ 'none', 'of', 'them', 'are', 'selected' ];
                    // act
                    const state = getNewState(node, selectedScriptNodeIds);
                    // assert
                    expect(state.indeterminate).to.equal(false);
                });
            });
        });
    });
    function getScriptNode(scriptNodeId: string = 'script'): ILiquorTreeNode {
        return {
            id: scriptNodeId,
            data: {
                type: NodeType.Script,
                documentationUrls: [],
                isReversible: false,
            },
            children: [],
        };
    }
});
