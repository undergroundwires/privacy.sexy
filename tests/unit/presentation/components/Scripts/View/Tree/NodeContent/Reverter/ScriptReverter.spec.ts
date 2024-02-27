import { describe, it, expect } from 'vitest';
import { ScriptReverter } from '@/presentation/components/Scripts/View/Tree/NodeContent/Reverter/ScriptReverter';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import { getScriptNodeId } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/CategoryNodeMetadataConverter';
import { UserSelectionStub } from '@tests/unit/shared/Stubs/UserSelectionStub';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { ScriptSelectionStub } from '@tests/unit/shared/Stubs/ScriptSelectionStub';

describe('ScriptReverter', () => {
  describe('getState', () => {
    // arrange
    const script = new ScriptStub('id');
    const nodeId = getScriptNodeId(script);
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly selectedScripts: readonly SelectedScript[];
      readonly expectedState: boolean;
    }> = [
      {
        description: 'returns `false` when script is not selected',
        selectedScripts: [],
        expectedState: false,
      },
      {
        description: 'returns `false` when script is selected but not reverted',
        selectedScripts: [
          new SelectedScriptStub(script).withRevert(false),
          new SelectedScriptStub(new ScriptStub('dummy')),
        ],
        expectedState: false,
      },
      {
        description: 'returns `true` when script is selected and reverted',
        selectedScripts: [
          new SelectedScriptStub(script).withRevert(true),
          new SelectedScriptStub(new ScriptStub('dummy')),
        ],
        expectedState: true,
      },
    ];
    testScenarios.forEach((
      { description, selectedScripts, expectedState },
    ) => {
      it(description, () => {
        const sut = new ScriptReverter(nodeId);
        // act
        const actual = sut.getState(selectedScripts);
        // assert
        expect(actual).to.equal(expectedState);
      });
    });
  });
  describe('selectWithRevertState', () => {
    // arrange
    const script = new ScriptStub('id');
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly selection: readonly SelectedScript[];
      readonly expectedRevert: boolean;
    }> = [
      {
        description: 'selects as reverted when initially unselected',
        selection: [],
        expectedRevert: true,
      },
      {
        description: 'selects as non-reverted when initially unselected',
        selection: [],
        expectedRevert: false,
      },
      {
        description: 'toggles to non-reverted for previously reverted scripts',
        selection: [
          new SelectedScriptStub(script).withRevert(true),
        ],
        expectedRevert: false,
      },
      {
        description: 'toggles to reverted for previously non-reverted scripts',
        selection: [
          new SelectedScriptStub(script).withRevert(false),
        ],
        expectedRevert: true,
      },
      {
        description: 'maintains reverted state for already reverted scripts',
        selection: [
          new SelectedScriptStub(script).withRevert(true),
        ],
        expectedRevert: true,
      },
      {
        description: 'maintains non-reverted state for already non-reverted scripts',
        selection: [
          new SelectedScriptStub(script).withRevert(false),
        ],
        expectedRevert: false,
      },
    ];
    const nodeId = getScriptNodeId(script);
    testScenarios.forEach((
      { description, selection, expectedRevert },
    ) => {
      it(description, () => {
        const scriptSelection = new ScriptSelectionStub()
          .withSelectedScripts(selection);
        const userSelection = new UserSelectionStub().withScripts(scriptSelection);
        const sut = new ScriptReverter(nodeId);
        const revertState = expectedRevert;
        // act
        sut.selectWithRevertState(revertState, userSelection);
        // assert
        expect(scriptSelection.isScriptSelected(script.id, expectedRevert)).to.equal(true);
      });
    });
  });
});
