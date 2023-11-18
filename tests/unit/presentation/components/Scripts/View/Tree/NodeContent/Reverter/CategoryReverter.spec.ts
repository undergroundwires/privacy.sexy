import { describe, it, expect } from 'vitest';
import { CategoryReverter } from '@/presentation/components/Scripts/View/Tree/NodeContent/Reverter/CategoryReverter';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { getCategoryNodeId } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/CategoryNodeMetadataConverter';
import { UserSelectionStub } from '@tests/unit/shared/Stubs/UserSelectionStub';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { CategorySelectionStub } from '@tests/unit/shared/Stubs/CategorySelectionStub';

describe('CategoryReverter', () => {
  describe('getState', () => {
    // arrange
    const scripts = [
      new ScriptStub('reversible').withRevertCode('REM revert me'),
      new ScriptStub('reversible2').withRevertCode('REM revert me 2'),
    ];
    const category = new CategoryStub(1).withScripts(...scripts);
    const nodeId = getCategoryNodeId(category);
    const collection = new CategoryCollectionStub().withAction(category);
    const sut = new CategoryReverter(nodeId, collection);
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly selectedScripts: readonly SelectedScript[];
      readonly expectedState: boolean;
    }> = [
      {
        description: 'returns `false` for non-reverted subscripts',
        selectedScripts: scripts.map(
          (script) => new SelectedScriptStub(script).withRevert(false),
        ),
        expectedState: false,
      },
      {
        description: 'returns `false` when only some subscripts are reverted',
        selectedScripts: [
          new SelectedScriptStub(scripts[0]).withRevert(false),
          new SelectedScriptStub(scripts[0]).withRevert(true),
        ],
        expectedState: false,
      },
      {
        description: 'returns `true` when all subscripts are reverted',
        selectedScripts: scripts.map(
          (script) => new SelectedScriptStub(script).withRevert(true),
        ),
        expectedState: true,
      },
    ];
    testScenarios.forEach((
      { description, selectedScripts, expectedState },
    ) => {
      it(description, () => {
        // act
        const actual = sut.getState(selectedScripts);
        // assert
        expect(actual).to.equal(expectedState);
      });
    });
  });
  describe('selectWithRevertState', () => {
    // arrange
    const allScripts = [
      new ScriptStub('reversible').withRevertCode('REM revert me'),
      new ScriptStub('reversible2').withRevertCode('REM revert me 2'),
    ];
    const category = new CategoryStub(1).withScripts(...allScripts);
    const collection = new CategoryCollectionStub().withAction(category);
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly expectedRevert: boolean;
    }> = [
      {
        description: 'selects with revert',
        expectedRevert: true,
      },
      {
        description: 'selects without revert',
        expectedRevert: false,
      },
    ];
    const nodeId = getCategoryNodeId(category);
    testScenarios.forEach((
      { description, expectedRevert },
    ) => {
      it(description, () => {
        const categorySelection = new CategorySelectionStub();
        const sut = new CategoryReverter(nodeId, collection);
        const revertState = expectedRevert;
        // act
        sut.selectWithRevertState(
          revertState,
          new UserSelectionStub().withCategories(categorySelection),
        );
        // assert
        expect(categorySelection.isCategorySelected(category.id, expectedRevert)).to.equal(true);
      });
    });
  });
});
