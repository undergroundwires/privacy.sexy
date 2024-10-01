import { describe, it, expect } from 'vitest';
import { getReverter } from '@/presentation/components/Scripts/View/Tree/NodeContent/Reverter/ReverterFactory';
import { ScriptReverter } from '@/presentation/components/Scripts/View/Tree/NodeContent/Reverter/ScriptReverter';
import { CategoryReverter } from '@/presentation/components/Scripts/View/Tree/NodeContent/Reverter/CategoryReverter';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { createNodeIdForExecutable } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/CategoryNodeMetadataConverter';
import { type NodeMetadata, NodeType } from '@/presentation/components/Scripts/View/Tree/NodeContent/NodeMetadata';
import type { TreeNodeId } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';

describe('ReverterFactory', () => {
  describe('getReverter', () => {
    it(`gets ${CategoryReverter.name} for category node`, () => {
      // arrange
      const category = new CategoryStub('test-action-category').withScriptIds('55');
      const node = getNodeContentStub(createNodeIdForExecutable(category), NodeType.Category);
      const collection = new CategoryCollectionStub()
        .withAction(category);
      // act
      const result = getReverter(node, collection);
      // assert
      expect(result instanceof CategoryReverter).to.equal(true);
    });
    it(`gets ${ScriptReverter.name} for script node`, () => {
      // arrange
      const script = new ScriptStub('test');
      const node = getNodeContentStub(createNodeIdForExecutable(script), NodeType.Script);
      const collection = new CategoryCollectionStub()
        .withAction(new CategoryStub('test-action-category').withScript(script));
      // act
      const result = getReverter(node, collection);
      // assert
      expect(result instanceof ScriptReverter).to.equal(true);
    });
  });
  function getNodeContentStub(nodeId: TreeNodeId, type: NodeType): NodeMetadata {
    return {
      executableId: nodeId,
      text: 'text',
      isReversible: false,
      docs: [],
      children: [],
      type,
    };
  }
});
