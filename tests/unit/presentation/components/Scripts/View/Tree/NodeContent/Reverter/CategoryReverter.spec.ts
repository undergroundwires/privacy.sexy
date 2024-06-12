import { describe, it, expect } from 'vitest';
import { CategoryReverter } from '@/presentation/components/Scripts/View/Tree/NodeContent/Reverter/CategoryReverter';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { getCategoryNodeId } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/CategoryNodeMetadataConverter';
import { UserSelectionStub } from '@tests/unit/shared/Stubs/UserSelectionStub';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { CategorySelectionStub } from '@tests/unit/shared/Stubs/CategorySelectionStub';
import type { Script } from '@/domain/Executables/Script/Script';

describe('CategoryReverter', () => {
  describe('getState', () => {
    // arrange
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly allScripts: readonly Script[];
      readonly selectScripts: (allScripts: readonly Script[]) => readonly SelectedScript[];
      readonly expectedState: boolean;
    }> = [
      {
        description: 'returns true when all scripts are reverted',
        allScripts: [
          new ScriptStub('0').withReversibility(true),
          new ScriptStub('1').withReversibility(true),
        ],
        selectScripts: (allScripts) => [
          new SelectedScriptStub(allScripts[0]).withRevert(true),
          new SelectedScriptStub(allScripts[1]).withRevert(true),
        ],
        expectedState: true,
      },
      {
        description: 'returns true when only reversible scripts are reverted',
        allScripts: [
          new ScriptStub('0').withReversibility(false),
          new ScriptStub('1').withReversibility(true),
          new ScriptStub('2').withReversibility(true),
        ],
        selectScripts: (allScripts) => [
          new SelectedScriptStub(allScripts[1]).withRevert(true),
          new SelectedScriptStub(allScripts[2]).withRevert(true),
        ],
        expectedState: true,
      },
      {
        description: 'returns false when no scripts are reverted',
        allScripts: [
          new ScriptStub('0').withReversibility(true),
          new ScriptStub('1').withReversibility(true),
        ],
        selectScripts: (allScripts) => [
          new SelectedScriptStub(allScripts[0]).withRevert(false),
          new SelectedScriptStub(allScripts[1]).withRevert(false),
        ],
        expectedState: false,
      },
      {
        description: 'returns false when some reversible scripts are not reverted',
        allScripts: [
          new ScriptStub('0').withReversibility(true),
          new ScriptStub('1').withReversibility(true),
        ],
        selectScripts: (allScripts) => [
          new SelectedScriptStub(allScripts[0]).withRevert(false),
          new SelectedScriptStub(allScripts[1]).withRevert(true),
        ],
        expectedState: false,
      },
      {
        description: 'returns false when any reversible script is not reverted',
        allScripts: [
          new ScriptStub('0').withReversibility(false),
          new ScriptStub('1').withReversibility(true),
          new ScriptStub('2').withReversibility(true),
        ],
        selectScripts: (allScripts) => [
          new SelectedScriptStub(allScripts[1]).withRevert(true),
          new SelectedScriptStub(allScripts[2]).withRevert(false),
        ],
        expectedState: false,
      },
      {
        description: 'returns false when no reversible scripts are reverted',
        allScripts: [
          new ScriptStub('0').withReversibility(true),
          new ScriptStub('1').withReversibility(true),
        ],
        selectScripts: (allScripts) => [
          new SelectedScriptStub(allScripts[0]).withRevert(false),
          new SelectedScriptStub(allScripts[1]).withRevert(false),
        ],
        expectedState: false,
      },
      {
        description: 'returns false when all reversible scripts are not reverted',
        allScripts: [
          new ScriptStub('0').withReversibility(false),
          new ScriptStub('1').withReversibility(true),
          new ScriptStub('2').withReversibility(true),
        ],
        selectScripts: (allScripts) => [
          new SelectedScriptStub(allScripts[1]).withRevert(false),
          new SelectedScriptStub(allScripts[2]).withRevert(false),
        ],
        expectedState: false,
      },
      {
        description: 'returns false when no scripts are reversible',
        allScripts: [
          new ScriptStub('0').withReversibility(false),
          new ScriptStub('1').withReversibility(false),
          new ScriptStub('2').withReversibility(false),
        ],
        selectScripts: () => [],
        expectedState: false,
      },
    ];
    testScenarios.forEach(({
      description, allScripts, selectScripts, expectedState,
    }) => {
      it(description, () => {
        // arrange
        const category = new CategoryStub(1).withScripts(...allScripts);
        const categoryNodeId = getCategoryNodeId(category);
        const collection = new CategoryCollectionStub().withAction(category);
        const categoryReverter = new CategoryReverter(categoryNodeId, collection);
        const selectedScripts = selectScripts(allScripts);
        // act
        const actual = categoryReverter.getState(selectedScripts);
        // assert
        expect(actual).to.equal(expectedState);
      });
    });
  });
  describe('selectWithRevertState', () => {
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly expectedRevertState: boolean;
    }> = [
      {
        description: 'selects with revert',
        expectedRevertState: true,
      },
      {
        description: 'selects without revert',
        expectedRevertState: false,
      },
    ];
    testScenarios.forEach((
      { description, expectedRevertState },
    ) => {
      it(description, () => {
        // arrange
        const allScripts = [
          new ScriptStub('reversible').withReversibility(true),
          new ScriptStub('reversible2').withReversibility(true),
        ];
        const category = new CategoryStub(1).withScripts(...allScripts);
        const nodeId = getCategoryNodeId(category);
        const collection = new CategoryCollectionStub().withAction(category);
        const categorySelection = new CategorySelectionStub();
        const categoryReverter = new CategoryReverter(nodeId, collection);
        const revertState = expectedRevertState;
        // act
        categoryReverter.selectWithRevertState(
          revertState,
          new UserSelectionStub().withCategories(categorySelection),
        );
        // assert
        const actualRevertState = categorySelection.isCategorySelected(
          category.id,
          expectedRevertState,
        );
        expect(actualRevertState).to.equal(true);
      });
    });
  });
});
