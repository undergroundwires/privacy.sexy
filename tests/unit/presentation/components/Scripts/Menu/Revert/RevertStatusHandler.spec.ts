import { describe, it, expect } from 'vitest';
import { RevertStatusType } from '@/presentation/components/Scripts/Menu/Revert/RevertStatusType';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { getCurrentRevertStatus, setCurrentRevertStatus } from '@/presentation/components/Scripts/Menu/Revert/RevertStatusHandler';
import { ScriptSelectionStub } from '@tests/unit/shared/Stubs/ScriptSelectionStub';
import type { ScriptSelectionChange } from '@/application/Context/State/Selection/Script/ScriptSelectionChange';

describe('RevertStatusHandler', () => {
  describe('getCurrentRevertStatus', () => {
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly selectedScripts: readonly SelectedScript[];
      readonly expectedRevertStatus: RevertStatusType;
    }> = [
      {
        description: 'no selection',
        selectedScripts: [],
        expectedRevertStatus: RevertStatusType.NoReversibleScripts,
      },
      {
        description: 'selected scripts are not reversible',
        selectedScripts: [
          createSelectedScript({ isReversible: false, isReverted: false }),
          createSelectedScript({ isReversible: false, isReverted: false }),
        ],
        expectedRevertStatus: RevertStatusType.NoReversibleScripts,
      },
      {
        description: 'all selected scripts are reversible and reverted',
        selectedScripts: [
          createSelectedScript({ isReversible: true, isReverted: true }),
          createSelectedScript({ isReversible: true, isReverted: true }),
        ],
        expectedRevertStatus: RevertStatusType.AllScriptsReverted,
      },
      {
        description: 'mixed selection with irreversible and reverted scripts',
        selectedScripts: [
          createSelectedScript({ isReversible: false, isReverted: false }),
          createSelectedScript({ isReversible: true, isReverted: true }),
        ],
        expectedRevertStatus: RevertStatusType.AllScriptsReverted,
      },
      {
        description: 'mixed revert state among reversible scripts',
        selectedScripts: [
          createSelectedScript({ isReversible: true, isReverted: true }),
          createSelectedScript({ isReversible: true, isReverted: false }),
        ],
        expectedRevertStatus: RevertStatusType.SomeScriptsReverted,
      },
      {
        description: 'mixed selection with irreversible and reversible scripts in mixed revert state',
        selectedScripts: [
          createSelectedScript({ isReversible: false, isReverted: false }),
          createSelectedScript({ isReversible: true, isReverted: true }),
          createSelectedScript({ isReversible: true, isReverted: false }),
        ],
        expectedRevertStatus: RevertStatusType.SomeScriptsReverted,
      },
    ];
    testScenarios.forEach((
      { description, selectedScripts, expectedRevertStatus },
    ) => {
      it(`${description} returns ${RevertStatusType[expectedRevertStatus]}`, () => {
        // arrange
        const selection = new ScriptSelectionStub()
          .withSelectedScripts(selectedScripts);
        // act
        const actualRevertStatus = getCurrentRevertStatus(selection);
        // assert
        expect(actualRevertStatus).to.equal(expectedRevertStatus);
      });
    });
  });
  describe('setCurrentRevertStatus', () => {
    const selectionTestScenarios: ReadonlyArray<{
      readonly description: string;
      readonly createSelectedScripts: (
        desiredRevertStatus: boolean,
      ) => readonly SelectedScript[];
      readonly expectChanges: (
        allScripts: readonly SelectedScript[],
        desiredRevertStatus: boolean,
      ) => readonly ScriptSelectionChange[];
    }> = [
      {
        description: 'single reversible script',
        createSelectedScripts: (desiredRevertStatus) => [
          createSelectedScript({ isReversible: true, isReverted: !desiredRevertStatus }),
        ],
        expectChanges: (allScripts, desiredRevertStatus) => [
          createScriptSelectionChange(allScripts[0], desiredRevertStatus),
        ],
      },
      {
        description: 'multiple reversible scripts',
        createSelectedScripts: (desiredRevertStatus) => [
          createSelectedScript({ isReversible: true, isReverted: !desiredRevertStatus }),
          createSelectedScript({ isReversible: true, isReverted: !desiredRevertStatus }),
        ],
        expectChanges: (allScripts, desiredRevertStatus) => [
          createScriptSelectionChange(allScripts[0], desiredRevertStatus),
          createScriptSelectionChange(allScripts[1], desiredRevertStatus),
        ],
      },
      {
        description: 'no selected scripts',
        createSelectedScripts: () => [],
        expectChanges: () => [],
      },
      {
        description: 'no reversible scripts',
        createSelectedScripts: (desiredRevertStatus) => [
          createSelectedScript({ isReversible: false, isReverted: !desiredRevertStatus }),
          createSelectedScript({ isReversible: false, isReverted: !desiredRevertStatus }),
        ],
        expectChanges: () => [],
      },
      {
        description: 'reversible and irreversible scripts',
        createSelectedScripts: (desiredRevertStatus) => [
          createSelectedScript({ isReversible: true, isReverted: !desiredRevertStatus }),
          createSelectedScript({ isReversible: false, isReverted: !desiredRevertStatus }),
          createSelectedScript({ isReversible: true, isReverted: !desiredRevertStatus }),
          createSelectedScript({ isReversible: false, isReverted: !desiredRevertStatus }),
        ],
        expectChanges: (allScripts, desiredRevertStatus) => [
          createScriptSelectionChange(allScripts[0], desiredRevertStatus),
          createScriptSelectionChange(allScripts[2], desiredRevertStatus),
        ],
      },
      {
        description: 'reversible scripts already in the desired revert status',
        createSelectedScripts: (desiredRevertStatus) => [
          createSelectedScript({ isReversible: true, isReverted: desiredRevertStatus }),
          createSelectedScript({ isReversible: true, isReverted: desiredRevertStatus }),
        ],
        expectChanges: () => [],
      },
    ];
    selectionTestScenarios.forEach(({
      description: selectionDescription, createSelectedScripts, expectChanges,
    }) => {
      const revertStatusTestScenarios: ReadonlyArray<{
        readonly description: string;
        readonly desiredRevertStatus: boolean;
      }> = [
        {
          description: 'enforcing revert state',
          desiredRevertStatus: true,
        },
        {
          description: 'enforcing non-revert state',
          desiredRevertStatus: false,
        },
      ];
      revertStatusTestScenarios.forEach(({
        description: revertStatusDescription, desiredRevertStatus,
      }) => {
        it(`${revertStatusDescription} - ${selectionDescription}`, () => {
          // arrange
          const selectedScripts = createSelectedScripts(desiredRevertStatus);
          const selection = new ScriptSelectionStub()
            .withSelectedScripts(selectedScripts);
          // act
          setCurrentRevertStatus(desiredRevertStatus, selection);
          // assert
          const expectedChanges = expectChanges(selectedScripts, desiredRevertStatus);
          selection.assertSelectionChanges(expectedChanges);
        });
      });
    });
  });
});

function createSelectedScript(options: {
  readonly isReversible: boolean;
  readonly isReverted: boolean;
}): SelectedScript {
  const id = (Math.random() + 1).toString(36).substring(7);
  const script = new ScriptStub(id)
    .withReversibility(options.isReversible);
  return new SelectedScriptStub(script)
    .withRevert(options.isReverted);
}

function createScriptSelectionChange(
  script: SelectedScript,
  isReverted: boolean,
): ScriptSelectionChange {
  return {
    scriptId: script.id,
    newStatus: {
      isSelected: true,
      isReverted,
    },
  };
}
