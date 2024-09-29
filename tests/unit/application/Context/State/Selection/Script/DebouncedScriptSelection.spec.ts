import { describe, it, expect } from 'vitest';
import { type DebounceFunction, DebouncedScriptSelection } from '@/application/Context/State/Selection/Script/DebouncedScriptSelection';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { BatchedDebounceStub } from '@tests/unit/shared/Stubs/BatchedDebounceStub';
import type { ScriptSelectionChange, ScriptSelectionChangeCommand } from '@/application/Context/State/Selection/Script/ScriptSelectionChange';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import type { Script } from '@/domain/Executables/Script/Script';
import { expectEqualSelectedScripts } from './ExpectEqualSelectedScripts';

type DebounceArg = ScriptSelectionChangeCommand;

describe('DebouncedScriptSelection', () => {
  describe('constructor', () => {
    describe('initialization of selected scripts', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly selectedScripts: readonly SelectedScript[];
      }> = [
        {
          description: 'initializes with no scripts when given empty array',
          selectedScripts: [],
        },
        {
          description: 'initializes with a single script when given one script',
          selectedScripts: [new SelectedScriptStub(new ScriptStub('s1'))],
        },
        {
          description: 'initializes with multiple scripts when given multiple scripts',
          selectedScripts: [
            new SelectedScriptStub(new ScriptStub('s1')),
            new SelectedScriptStub(new ScriptStub('s2')),
          ],
        },
      ];
      testScenarios.forEach(({ description, selectedScripts }) => {
        it(description, () => {
          // arrange
          const expectedScripts = selectedScripts;
          const builder = new DebouncedScriptSelectionBuilder()
            .withSelectedScripts(selectedScripts);
          // act
          const selection = builder.build();
          const actualScripts = selection.selectedScripts;
          // assert
          expectEqualSelectedScripts(actualScripts, expectedScripts);
        });
      });
    });
    describe('debounce configuration', () => {
      /*
        Note: These tests cover internal implementation details, particularly the debouncing logic,
        to ensure comprehensive code coverage. They are not focused on the public API. While useful
        for detecting subtle bugs, they might need updates during refactoring if internal structures
        change but external behaviors remain the same.
      */
      it('sets up debounce with a callback function', () => {
        // arrange
        const debounceStub = new BatchedDebounceStub<DebounceArg>();
        const builder = new DebouncedScriptSelectionBuilder()
          .withBatchedDebounce(debounceStub.func);
        // act
        builder.build();
        // assert
        expect(debounceStub.callHistory).to.have.lengthOf(1);
        const [debounceFunc] = debounceStub.callHistory[0];
        expectExists(debounceFunc);
      });
      it('configures debounce with specific delay ', () => {
        // arrange
        const expectedDebounceInMs = 100;
        const debounceStub = new BatchedDebounceStub<DebounceArg>();
        const builder = new DebouncedScriptSelectionBuilder()
          .withBatchedDebounce(debounceStub.func);
        // act
        builder.build();
        // assert
        expect(debounceStub.callHistory).to.have.lengthOf(1);
        const [, waitInMs] = debounceStub.callHistory[0];
        expect(waitInMs).to.equal(expectedDebounceInMs);
      });
      it('applies debouncing to processChanges method', () => {
        // arrange
        const expectedFunc = () => {};
        const debounceMock: DebounceFunction = () => expectedFunc;
        const builder = new DebouncedScriptSelectionBuilder()
          .withBatchedDebounce(debounceMock);
        // act
        const selection = builder.build();
        // assert
        const actualFunction = selection.processChanges;
        expect(actualFunction).to.equal(expectedFunc);
      });
    });
  });
  describe('isSelected', () => {
    it('returns false for an unselected script', () => {
      // arrange
      const expectedResult = false;
      const { scriptSelection, unselectedScripts } = setupTestWithPreselectedScripts({
        preselect: (allScripts) => [allScripts[0]],
      });
      const scriptIdToCheck = unselectedScripts[0].executableId;
      // act
      const actual = scriptSelection.isSelected(scriptIdToCheck);
      // assert
      expect(actual).to.equal(expectedResult);
    });
    it('returns true for a selected script', () => {
      // arrange
      const expectedResult = true;
      const { scriptSelection, preselectedScripts } = setupTestWithPreselectedScripts({
        preselect: (allScripts) => [allScripts[0]],
      });
      const scriptIdToCheck = preselectedScripts[0].id;
      // act
      const actual = scriptSelection.isSelected(scriptIdToCheck);
      // assert
      expect(actual).to.equal(expectedResult);
    });
  });
  describe('deselectAll', () => {
    it('removes all selected scripts', () => {
      // arrange
      const { scriptSelection, changeEvents } = setupTestWithPreselectedScripts({
        preselect: (scripts) => [scripts[0], scripts[1]],
      });
      // act
      scriptSelection.deselectAll();
      // assert
      expect(changeEvents).to.have.lengthOf(1);
      expect(changeEvents[0]).to.have.lengthOf(0);
      expect(scriptSelection.selectedScripts).to.have.lengthOf(0);
    });
    it('does not notify when no scripts are selected', () => {
      // arrange
      const { scriptSelection, changeEvents } = setupTestWithPreselectedScripts({
        preselect: () => [],
      });
      // act
      scriptSelection.deselectAll();
      // assert
      expect(changeEvents).to.have.lengthOf(0);
      expect(scriptSelection.selectedScripts).to.have.lengthOf(0);
    });
  });
  describe('selectAll', () => {
    it('selects all available scripts', () => {
      // arrange
      const selectedRevertState = false;
      const { scriptSelection, changeEvents, allScripts } = setupTestWithPreselectedScripts({
        preselect: () => [],
      });
      const expectedSelection = allScripts.map(
        (s) => s.toSelectedScript().withRevert(selectedRevertState),
      );
      // act
      scriptSelection.selectAll();
      // assert
      expect(changeEvents).to.have.lengthOf(1);
      expectEqualSelectedScripts(changeEvents[0], expectedSelection);
      expectEqualSelectedScripts(scriptSelection.selectedScripts, expectedSelection);
    });
    it('does not notify when no new scripts are selected', () => {
      // arrange
      const { scriptSelection, changeEvents } = setupTestWithPreselectedScripts({
        preselect: (allScripts) => allScripts,
      });
      // act
      scriptSelection.selectAll();
      // assert
      expect(changeEvents).to.have.lengthOf(0);
    });
  });
  describe('selectOnly', () => {
    describe('selects correctly', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly preselect: (allScripts: TestScripts) => readonly SelectedScriptStub[],
        readonly toSelect: (allScripts: TestScripts) => readonly ScriptStub[];
        readonly getExpectedFinalSelection: (allScripts: TestScripts) => readonly SelectedScript[],
      }> = [
        {
          description: 'adds expected scripts to empty selection as non-reverted',
          preselect: () => [],
          toSelect: (allScripts) => [allScripts[0]],
          getExpectedFinalSelection: (allScripts) => [
            allScripts[0].toSelectedScript().withRevert(false),
          ],
        },
        {
          description: 'adds expected scripts to existing selection as non-reverted',
          preselect: (allScripts) => [allScripts[0], allScripts[1]]
            .map((s) => s.toSelectedScript().withRevert(false)),
          toSelect: (allScripts) => [...allScripts],
          getExpectedFinalSelection: (allScripts) => allScripts
            .map((s) => s.toSelectedScript().withRevert(false)),
        },
        {
          description: 'removes other scripts from selection',
          preselect: (allScripts) => allScripts
            .map((s) => s.toSelectedScript().withRevert(false)),
          toSelect: (allScripts) => [allScripts[0]],
          getExpectedFinalSelection: (allScripts) => [
            allScripts[0].toSelectedScript().withRevert(false),
          ],
        },
        {
          description: 'handles both addition and removal of scripts correctly',
          preselect: (allScripts) => [allScripts[0], allScripts[2]] // Removes "2"
            .map((s) => s.toSelectedScript().withRevert(false)),
          toSelect: (allScripts) => [allScripts[0], allScripts[1]], // Adds "1"
          getExpectedFinalSelection: (allScripts) => [
            allScripts[0].toSelectedScript().withRevert(false),
            allScripts[1].toSelectedScript().withRevert(false),
          ],
        },
      ];
      testScenarios.forEach(({
        description, preselect, toSelect, getExpectedFinalSelection,
      }) => {
        it(description, () => {
          // arrange
          const { scriptSelection, changeEvents, allScripts } = setupTestWithPreselectedScripts({
            preselect,
          });
          const scriptsToSelect = toSelect(allScripts);
          const expectedSelection = getExpectedFinalSelection(allScripts);
          // act
          scriptSelection.selectOnly(scriptsToSelect);
          // assert
          expect(changeEvents).to.have.lengthOf(1);
          expectEqualSelectedScripts(changeEvents[0], expectedSelection);
          expectEqualSelectedScripts(scriptSelection.selectedScripts, expectedSelection);
        });
      });
    });
    describe('does not notify for unchanged selection', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly preselect: TestScriptSelector;
      }> = [
        {
          description: 'unchanged selection with reverted scripts',
          preselect: (allScripts) => allScripts.map((s) => s.toSelectedScript().withRevert(true)),
        },
        {
          description: 'unchanged selection with non-reverted scripts',
          preselect: (allScripts) => allScripts.map((s) => s.toSelectedScript().withRevert(false)),
        },
        {
          description: 'unchanged selection with mixed revert states',
          preselect: (allScripts) => [
            allScripts[0].toSelectedScript().withRevert(true),
            allScripts[1].toSelectedScript().withRevert(false),
          ],
        },
      ];
      testScenarios.forEach(({
        description, preselect,
      }) => {
        it(description, () => {
          // arrange
          const {
            scriptSelection, changeEvents, preselectedScripts,
          } = setupTestWithPreselectedScripts({ preselect });
          const scriptsToSelect = preselectedScripts.map((s) => s.script);
          // act
          scriptSelection.selectOnly(scriptsToSelect);
          // assert
          expect(changeEvents).to.have.lengthOf(0);
        });
      });
    });
    it('throws error when an empty script array is passed', () => {
      // arrange
      const expectedError = 'Provided script array is empty. To deselect all scripts, please use the deselectAll() method instead.';
      const scripts: readonly Script[] = [];
      const scriptSelection = new DebouncedScriptSelectionBuilder().build();
      // act
      const act = () => scriptSelection.selectOnly(scripts);
      // assert
      expect(act).to.throw(expectedError);
    });
  });
  describe('processChanges', () => {
    describe('mutates correctly', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly preselect: TestScriptSelector;
        readonly getChanges: (allScripts: TestScripts) => readonly ScriptSelectionChange[];
        readonly getExpectedFinalSelection: (allScripts: TestScripts) => readonly SelectedScript[],
      }> = [
        {
          description: 'correctly adds a new reverted script',
          preselect: (allScripts) => [allScripts[0], allScripts[1]]
            .map((s) => s.toSelectedScript()),
          getChanges: (allScripts) => [
            {
              scriptId: allScripts[2].executableId,
              newStatus: { isReverted: true, isSelected: true },
            },
          ],
          getExpectedFinalSelection: (allScripts) => [
            allScripts[0].toSelectedScript(),
            allScripts[1].toSelectedScript(),
            new SelectedScriptStub(allScripts[2]).withRevert(true),
          ],
        },
        {
          description: 'correctly adds a new non-reverted script',
          preselect: (allScripts) => [allScripts[0], allScripts[1]]
            .map((s) => s.toSelectedScript()),
          getChanges: (allScripts) => [
            {
              scriptId: allScripts[2].executableId,
              newStatus: { isReverted: false, isSelected: true },
            },
          ],
          getExpectedFinalSelection: (allScripts) => [
            allScripts[0].toSelectedScript(),
            allScripts[1].toSelectedScript(),
            new SelectedScriptStub(allScripts[2]).withRevert(false),
          ],
        },
        {
          description: 'correctly removes an existing script',
          preselect: (allScripts) => [allScripts[0], allScripts[1]]
            .map((s) => s.toSelectedScript()),
          getChanges: (allScripts) => [
            { scriptId: allScripts[0].executableId, newStatus: { isSelected: false } },
          ],
          getExpectedFinalSelection: (allScripts) => [
            allScripts[1].toSelectedScript(),
          ],
        },
        {
          description: 'updates revert status to true for an existing script',
          preselect: (allScripts) => [
            allScripts[0].toSelectedScript().withRevert(false),
            allScripts[1].toSelectedScript(),
          ],
          getChanges: (allScripts) => [
            {
              scriptId: allScripts[0].executableId,
              newStatus: { isSelected: true, isReverted: true },
            },
          ],
          getExpectedFinalSelection: (allScripts) => [
            allScripts[0].toSelectedScript().withRevert(true),
            allScripts[1].toSelectedScript(),
          ],
        },
        {
          description: 'updates revert status to false for an existing script',
          preselect: (allScripts) => [
            allScripts[0].toSelectedScript().withRevert(true),
            allScripts[1].toSelectedScript(),
          ],
          getChanges: (allScripts) => [
            {
              scriptId: allScripts[0].executableId,
              newStatus: { isSelected: true, isReverted: false },
            },
          ],
          getExpectedFinalSelection: (allScripts) => [
            allScripts[0].toSelectedScript().withRevert(false),
            allScripts[1].toSelectedScript(),
          ],
        },
        {
          description: 'handles mixed operations: add, update, remove',
          preselect: (allScripts) => [
            allScripts[0].toSelectedScript().withRevert(true), // update
            allScripts[2].toSelectedScript(), // remove
          ],
          getChanges: (allScripts) => [
            {
              scriptId: allScripts[0].executableId,
              newStatus: { isSelected: true, isReverted: false },
            },
            {
              scriptId: allScripts[1].executableId,
              newStatus: { isSelected: true, isReverted: true },
            },
            {
              scriptId: allScripts[2].executableId,
              newStatus: { isSelected: false },
            },
          ],
          getExpectedFinalSelection: (allScripts) => [
            allScripts[0].toSelectedScript().withRevert(false),
            allScripts[1].toSelectedScript().withRevert(true),
          ],
        },
      ];
      testScenarios.forEach(({
        description, preselect, getChanges, getExpectedFinalSelection,
      }) => {
        it(description, () => {
          // arrange
          const { scriptSelection, changeEvents, allScripts } = setupTestWithPreselectedScripts({
            preselect,
          });
          const changes = getChanges(allScripts);
          // act
          scriptSelection.processChanges({
            changes,
          });
          // assert
          const expectedSelection = getExpectedFinalSelection(allScripts);
          expect(changeEvents).to.have.lengthOf(1);
          expectEqualSelectedScripts(changeEvents[0], expectedSelection);
          expectEqualSelectedScripts(scriptSelection.selectedScripts, expectedSelection);
        });
      });
    });
    describe('does not mutate for unchanged data', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly preselect: TestScriptSelector;
        readonly getChanges: (allScripts: TestScripts) => readonly ScriptSelectionChange[];
      }> = [
        {
          description: 'does not change selection for an already selected script',
          preselect: (allScripts) => [allScripts[0].toSelectedScript().withRevert(true)],
          getChanges: (allScripts) => [
            {
              scriptId: allScripts[0].executableId,
              newStatus: { isReverted: true, isSelected: true },
            },
          ],
        },
        {
          description: 'does not change selection when deselecting a missing script',
          preselect: (allScripts) => [allScripts[0], allScripts[1]]
            .map((s) => s.toSelectedScript()),
          getChanges: (allScripts) => [
            { scriptId: allScripts[2].executableId, newStatus: { isSelected: false } },
          ],
        },
        {
          description: 'handles no mutations for mixed unchanged operations',
          preselect: (allScripts) => [allScripts[0].toSelectedScript().withRevert(false)],
          getChanges: (allScripts) => [
            {
              scriptId: allScripts[0].executableId,
              newStatus: { isSelected: true, isReverted: false },
            },
            {
              scriptId: allScripts[1].executableId,
              newStatus: { isSelected: false },
            },
          ],
        },
      ];
      testScenarios.forEach(({
        description, preselect, getChanges,
      }) => {
        it(description, () => {
          // arrange
          const { scriptSelection, changeEvents, allScripts } = setupTestWithPreselectedScripts({
            preselect,
          });
          const initialSelection = [...scriptSelection.selectedScripts];
          const changes = getChanges(allScripts);
          // act
          scriptSelection.processChanges({
            changes,
          });
          // assert
          expect(changeEvents).to.have.lengthOf(0);
          expectEqualSelectedScripts(scriptSelection.selectedScripts, initialSelection);
        });
      });
    });
    describe('debouncing', () => {
      it('queues commands for debouncing', () => {
        // arrange
        const debounceStub = new BatchedDebounceStub<DebounceArg>();
        const script = new ScriptStub('test');
        const selection = new DebouncedScriptSelectionBuilder()
          .withBatchedDebounce(debounceStub.func)
          .withCollection(createCollectionWithScripts(script))
          .build();
        const expectedCommand: ScriptSelectionChangeCommand = {
          changes: [
            { scriptId: script.executableId, newStatus: { isReverted: true, isSelected: true } },
          ],
        };
        // act
        selection.processChanges(expectedCommand);
        // assert
        expect(debounceStub.collectedArgs).to.have.lengthOf(1);
        expect(debounceStub.collectedArgs[0]).to.equal(expectedCommand);
      });
      it('does not apply changes during debouncing period', () => {
        // arrange
        const debounceStub = new BatchedDebounceStub<DebounceArg>()
          .withImmediateDebouncing(false);
        const script = new ScriptStub('test');
        const selection = new DebouncedScriptSelectionBuilder()
          .withBatchedDebounce(debounceStub.func)
          .withCollection(createCollectionWithScripts(script))
          .build();
        const changeEvents = watchForChangeEvents(selection);
        // act
        selection.processChanges({
          changes: [
            { scriptId: script.executableId, newStatus: { isReverted: true, isSelected: true } },
          ],
        });
        // assert
        expect(changeEvents).to.have.lengthOf(0);
        expectEqualSelectedScripts(selection.selectedScripts, []);
      });
      it('applies single change after debouncing period', () => {
        // arrange
        const debounceStub = new BatchedDebounceStub<DebounceArg>()
          .withImmediateDebouncing(false);
        const script = new ScriptStub('test');
        const selection = new DebouncedScriptSelectionBuilder()
          .withBatchedDebounce(debounceStub.func)
          .withCollection(createCollectionWithScripts(script))
          .build();
        const changeEvents = watchForChangeEvents(selection);
        const expectedSelection = [script.toSelectedScript().withRevert(true)];
        // act
        selection.processChanges({
          changes: [
            { scriptId: script.executableId, newStatus: { isReverted: true, isSelected: true } },
          ],
        });
        debounceStub.execute();
        // assert
        expect(changeEvents).to.have.lengthOf(1);
        expectEqualSelectedScripts(selection.selectedScripts, expectedSelection);
      });
      it('applies multiple changes after debouncing period', () => {
        // arrange
        const debounceStub = new BatchedDebounceStub<DebounceArg>()
          .withImmediateDebouncing(false);
        const scripts = [new ScriptStub('first'), new ScriptStub('second'), new ScriptStub('third')];
        const selection = new DebouncedScriptSelectionBuilder()
          .withBatchedDebounce(debounceStub.func)
          .withCollection(createCollectionWithScripts(...scripts))
          .build();
        const changeEvents = watchForChangeEvents(selection);
        const expectedSelection = scripts.map((s) => s.toSelectedScript().withRevert(true));
        // act
        for (const script of scripts) {
          selection.processChanges({
            changes: [
              { scriptId: script.executableId, newStatus: { isReverted: true, isSelected: true } },
            ],
          });
        }
        debounceStub.execute();
        // assert
        expect(changeEvents).to.have.lengthOf(1);
        expectEqualSelectedScripts(selection.selectedScripts, expectedSelection);
      });
    });
  });
});

function createCollectionWithScripts(...scripts: Script[]): CategoryCollectionStub {
  const category = new CategoryStub('parent-category').withScripts(...scripts);
  const collection = new CategoryCollectionStub().withAction(category);
  return collection;
}

function watchForChangeEvents(
  selection: DebouncedScriptSelection,
): ReadonlyArray<readonly SelectedScript[]> {
  const changes: Array<readonly SelectedScript[]> = [];
  selection.changed.on((s) => changes.push(s));
  return changes;
}

type TestScripts = readonly [ScriptStub, ScriptStub, ScriptStub];
type TestScriptSelector = (
  allScripts: TestScripts,
) => readonly SelectedScriptStub[] | readonly ScriptStub[];
function setupTestWithPreselectedScripts(options: {
  preselect: TestScriptSelector,
}) {
  const allScripts: TestScripts = [
    new ScriptStub('first-script'),
    new ScriptStub('second-script'),
    new ScriptStub('third-script'),
  ];
  const preselectedScripts = (() => {
    const initialSelection = options.preselect(allScripts);
    if (isScriptStubArray(initialSelection)) {
      return initialSelection.map((s) => s.toSelectedScript().withRevert(false));
    }
    return initialSelection;
  })();
  const unselectedScripts = allScripts.filter(
    (s) => !preselectedScripts.map((selected) => selected.id).includes(s.executableId),
  );
  const collection = createCollectionWithScripts(...allScripts);
  const scriptSelection = new DebouncedScriptSelectionBuilder()
    .withSelectedScripts(preselectedScripts)
    .withCollection(collection)
    .build();
  const changeEvents = watchForChangeEvents(scriptSelection);
  return {
    allScripts,
    unselectedScripts,
    preselectedScripts,
    scriptSelection,
    changeEvents,
  };
}

function isScriptStubArray(obj: readonly unknown[]): obj is readonly ScriptStub[] {
  return obj.length > 0 && obj[0] instanceof ScriptStub;
}

class DebouncedScriptSelectionBuilder {
  private collection: CategoryCollection = new CategoryCollectionStub()
    .withSomeActions();

  private selectedScripts: readonly SelectedScript[] = [];

  private batchedDebounce: DebounceFunction = new BatchedDebounceStub<DebounceArg>()
    .withImmediateDebouncing(true)
    .func;

  public withSelectedScripts(selectedScripts: readonly SelectedScript[]) {
    this.selectedScripts = selectedScripts;
    return this;
  }

  public withBatchedDebounce(batchedDebounce: DebounceFunction) {
    this.batchedDebounce = batchedDebounce;
    return this;
  }

  public withCollection(collection: CategoryCollection) {
    this.collection = collection;
    return this;
  }

  public build(): DebouncedScriptSelection {
    return new DebouncedScriptSelection(
      this.collection,
      this.selectedScripts,
      this.batchedDebounce,
    );
  }
}
