import 'mocha';
import { expect } from 'chai';
import { ILiquorTreeNode } from 'liquor-tree';
import { NodeType } from '@/presentation/Scripts/ScriptsTree/SelectableTree/Node/INode';
import { getNewCheckedState } from '@/presentation/Scripts/ScriptsTree/SelectableTree/LiquorTree/NodeWrapper/NodeStateUpdater';

describe('getNewCheckedState', () => {
    describe('script node', () => {
        it('state is true when selected', () => {
            // arrange
            const node = getScriptNode();
            const selectedScriptNodeIds = [ 'a', 'b', node.id, 'c' ];
            // act
            const actual = getNewCheckedState(node, selectedScriptNodeIds);
            // assert
            expect(actual).to.equal(true);
        });
        it('state is false when unselected', () => {
            // arrange
            const node = getScriptNode();
            const selectedScriptNodeIds = [ 'a', 'b', 'c' ];
            // act
            const actual = getNewCheckedState(node, selectedScriptNodeIds);
            // assert
            expect(actual).to.equal(false);
        });
    });
    describe('category node', () => {
        it('state is true when every child selected', () => {
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
            const actual = getNewCheckedState(node, selectedScriptNodeIds);
            // assert
            expect(actual).to.equal(true);
        });
        it('state is false when none of the children is selected', () => {
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
            const actual = getNewCheckedState(node, selectedScriptNodeIds);
            // assert
            expect(actual).to.equal(false);
        });
        it('state is false when some of the children is selected', () => {
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
            const actual = getNewCheckedState(node, selectedScriptNodeIds);
            // assert
            expect(actual).to.equal(false);
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
