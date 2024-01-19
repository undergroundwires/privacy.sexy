import { describe, it, expect } from 'vitest';
import { getReverter } from '@/presentation/components/Scripts/View/Tree/NodeContent/Reverter/ReverterFactory';
import { ScriptReverter } from '@/presentation/components/Scripts/View/Tree/NodeContent/Reverter/ScriptReverter';
import { CategoryReverter } from '@/presentation/components/Scripts/View/Tree/NodeContent/Reverter/CategoryReverter';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { getCategoryNodeId, getScriptNodeId } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/CategoryNodeMetadataConverter';
import { NodeType } from '@/application/Parser/NodeValidation/NodeType';
import { NodeMetadata } from '@/presentation/components/Scripts/View/Tree/NodeContent/NodeMetadata';

describe('ReverterFactory', () => {
  describe('getReverter', () => {
    it('gets CategoryReverter for category node', () => {
      // arrange
      const category = new CategoryStub(0).withScriptIds('55');
      const node = getNodeContentStub(getCategoryNodeId(category), NodeType.Category);
      const collection = new CategoryCollectionStub()
        .withAction(category);
      // act
      const result = getReverter(node, collection);
      // assert
      expect(result instanceof CategoryReverter).to.equal(true);
    });
    it('gets ScriptReverter for script node', () => {
      // arrange
      const script = new ScriptStub('test');
      const node = getNodeContentStub(getScriptNodeId(script), NodeType.Script);
      const collection = new CategoryCollectionStub()
        .withAction(new CategoryStub(0).withScript(script));
      // act
      const result = getReverter(node, collection);
      // assert
      expect(result instanceof ScriptReverter).to.equal(true);
    });
  });
  function getNodeContentStub(nodeId: string, type: NodeType): NodeMetadata {
    return {
      id: nodeId,
      text: 'text',
      isReversible: false,
      docs: [],
      children: [],
      type,
    };
  }
});
