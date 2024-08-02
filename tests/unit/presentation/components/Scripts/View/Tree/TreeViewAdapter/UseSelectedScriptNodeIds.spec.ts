import { describe, it, expect } from 'vitest';
import { useSelectedScriptNodeIds } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/UseSelectedScriptNodeIds';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import { createNodeIdForExecutable } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/CategoryNodeMetadataConverter';
import type { Script } from '@/domain/Executables/Script/Script';
import { UseUserSelectionStateStub } from '@tests/unit/shared/Stubs/UseUserSelectionStateStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import type { TreeNodeId } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import type { Executable } from '@/domain/Executables/Executable';

describe('useSelectedScriptNodeIds', () => {
  it('returns an empty array when no scripts are selected', () => {
    // arrange
    const { useSelectionStateStub, returnObject } = runHook();
    useSelectionStateStub.withSelectedScripts([]);
    // act
    const actualIds = returnObject.selectedScriptNodeIds.value;
    // assert
    expect(actualIds).to.have.lengthOf(0);
  });
  describe('returns correct node IDs for selected scripts', () => {
    it('immediately', () => {
      // arrange
      const selectedScripts = [
        new SelectedScriptStub(new ScriptStub('id-1')),
        new SelectedScriptStub(new ScriptStub('id-2')),
      ];
      const parsedNodeIds = new Map<Script, TreeNodeId>([
        [selectedScripts[0].script, 'expected-id-1'],
        [selectedScripts[1].script, 'expected-id-2'],
      ]);
      const useSelectionStateStub = new UseUserSelectionStateStub()
        .withSelectedScripts(selectedScripts);
      const { returnObject } = runHook({
        scriptNodeIdParser: createNodeIdParserFromMap(parsedNodeIds),
        useSelectionState: useSelectionStateStub,
      });
      // act
      const actualIds = returnObject.selectedScriptNodeIds.value;
      // assert
      const expectedNodeIds = [...parsedNodeIds.values()];
      expect(actualIds).to.have.lengthOf(expectedNodeIds.length);
      expect(actualIds).to.include.members(expectedNodeIds);
    });
    it('when the selection state changes', () => {
      // arrange
      const initialScripts = [];
      const changedScripts = [
        new SelectedScriptStub(new ScriptStub('id-1')),
        new SelectedScriptStub(new ScriptStub('id-2')),
      ];
      const parsedNodeIds = new Map<Script, TreeNodeId>([
        [changedScripts[0].script, 'expected-id-1'],
        [changedScripts[1].script, 'expected-id-2'],
      ]);
      const useSelectionStateStub = new UseUserSelectionStateStub()
        .withSelectedScripts(initialScripts);
      const { returnObject } = runHook({
        scriptNodeIdParser: createNodeIdParserFromMap(parsedNodeIds),
        useSelectionState: useSelectionStateStub,
      });
      // act
      useSelectionStateStub.withSelectedScripts(changedScripts);
      const actualIds = returnObject.selectedScriptNodeIds.value;
      // assert
      const expectedNodeIds = [...parsedNodeIds.values()];
      expect(actualIds).to.have.lengthOf(expectedNodeIds.length);
      expect(actualIds).to.include.members(expectedNodeIds);
    });
  });
});

type NodeIdParser = typeof createNodeIdForExecutable;

function createNodeIdParserFromMap(scriptToIdMap: Map<Executable, TreeNodeId>): NodeIdParser {
  return (script) => {
    const expectedId = scriptToIdMap.get(script);
    if (!expectedId) {
      throw new Error(`No mapped ID for script: ${JSON.stringify(script)}`);
    }
    return expectedId;
  };
}

function runHook(scenario?: {
  readonly scriptNodeIdParser?: NodeIdParser,
  readonly useSelectionState?: UseUserSelectionStateStub,
}) {
  const useSelectionStateStub = scenario?.useSelectionState ?? new UseUserSelectionStateStub();
  const nodeIdParser: NodeIdParser = scenario?.scriptNodeIdParser
    ?? ((script) => script.executableId);
  const returnObject = useSelectedScriptNodeIds(useSelectionStateStub.get(), nodeIdParser);
  return {
    returnObject,
    useSelectionStateStub,
  };
}
