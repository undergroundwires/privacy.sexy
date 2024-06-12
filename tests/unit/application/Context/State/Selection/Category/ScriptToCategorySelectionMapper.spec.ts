import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import type { ScriptSelection } from '@/application/Context/State/Selection/Script/ScriptSelection';
import type { ICategoryCollection } from '@/domain/ICategoryCollection';
import { ScriptToCategorySelectionMapper } from '@/application/Context/State/Selection/Category/ScriptToCategorySelectionMapper';
import { ScriptSelectionStub } from '@tests/unit/shared/Stubs/ScriptSelectionStub';
import type { CategorySelectionChange } from '@/application/Context/State/Selection/Category/CategorySelectionChange';
import type { ScriptSelectionChange, ScriptSelectionChangeCommand } from '@/application/Context/State/Selection/Script/ScriptSelectionChange';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';

describe('ScriptToCategorySelectionMapper', () => {
  describe('areAllScriptsSelected', () => {
    it('should return false for partially selected scripts', () => {
      // arrange
      const expected = false;
      const { sut, category } = setupTestWithPreselectedScripts({
        preselect: (allScripts) => [allScripts[0]],
      });
      // act
      const actual = sut.areAllScriptsSelected(category);
      // assert
      expect(actual).to.equal(expected);
    });
    it('should return true when all scripts are selected', () => {
      // arrange
      const expected = true;
      const { sut, category } = setupTestWithPreselectedScripts({
        preselect: (allScripts) => [...allScripts],
      });
      // act
      const actual = sut.areAllScriptsSelected(category);
      // assert
      expect(actual).to.equal(expected);
    });
  });
  describe('isAnyScriptSelected', () => {
    it('should return false with no selected scripts', () => {
      // arrange
      const expected = false;
      const { sut, category } = setupTestWithPreselectedScripts({
        preselect: () => [],
      });
      // act
      const actual = sut.isAnyScriptSelected(category);
      // assert
      expect(actual).to.equal(expected);
    });
    it('should return true with at least one script selected', () => {
      // arrange
      const expected = true;
      const { sut, category } = setupTestWithPreselectedScripts({
        preselect: (allScripts) => [allScripts[0]],
      });
      // act
      const actual = sut.isAnyScriptSelected(category);
      // assert
      expect(actual).to.equal(expected);
    });
  });
  describe('processChanges', () => {
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly changes: readonly CategorySelectionChange[];
      readonly categories: ReadonlyArray<{
        readonly categoryId: Category['id'],
        readonly scriptIds: readonly Script['id'][],
      }>;
      readonly expected: readonly ScriptSelectionChange[],
    }> = [
      {
        description: 'single script: select without revert',
        categories: [
          { categoryId: 1, scriptIds: ['single-script'] },
        ],
        changes: [
          { categoryId: 1, newStatus: { isSelected: true, isReverted: false } },
        ],
        expected: [
          { scriptId: 'single-script', newStatus: { isSelected: true, isReverted: false } },
        ],
      },
      {
        description: 'multiple scripts: select without revert',
        categories: [
          { categoryId: 1, scriptIds: ['script1-cat1', 'script2-cat1'] },
          { categoryId: 2, scriptIds: ['script3-cat2'] },
        ],
        changes: [
          { categoryId: 1, newStatus: { isSelected: true, isReverted: false } },
          { categoryId: 2, newStatus: { isSelected: true, isReverted: false } },
        ],
        expected: [
          { scriptId: 'script1-cat1', newStatus: { isSelected: true, isReverted: false } },
          { scriptId: 'script2-cat1', newStatus: { isSelected: true, isReverted: false } },
          { scriptId: 'script3-cat2', newStatus: { isSelected: true, isReverted: false } },
        ],
      },
      {
        description: 'single script: select with revert',
        categories: [
          { categoryId: 1, scriptIds: ['single-script'] },
        ],
        changes: [
          { categoryId: 1, newStatus: { isSelected: true, isReverted: true } },
        ],
        expected: [
          { scriptId: 'single-script', newStatus: { isSelected: true, isReverted: true } },
        ],
      },
      {
        description: 'multiple scripts: select with revert',
        categories: [
          { categoryId: 1, scriptIds: ['script-1-cat-1'] },
          { categoryId: 2, scriptIds: ['script-2-cat-2'] },
          { categoryId: 3, scriptIds: ['script-3-cat-3'] },
        ],
        changes: [
          { categoryId: 1, newStatus: { isSelected: true, isReverted: true } },
          { categoryId: 2, newStatus: { isSelected: true, isReverted: true } },
          { categoryId: 3, newStatus: { isSelected: true, isReverted: true } },
        ],
        expected: [
          { scriptId: 'script-1-cat-1', newStatus: { isSelected: true, isReverted: true } },
          { scriptId: 'script-2-cat-2', newStatus: { isSelected: true, isReverted: true } },
          { scriptId: 'script-3-cat-3', newStatus: { isSelected: true, isReverted: true } },
        ],
      },
      {
        description: 'single script: deselect',
        categories: [
          { categoryId: 1, scriptIds: ['single-script'] },
        ],
        changes: [
          { categoryId: 1, newStatus: { isSelected: false } },
        ],
        expected: [
          { scriptId: 'single-script', newStatus: { isSelected: false } },
        ],
      },
      {
        description: 'multiple scripts: deselect',
        categories: [
          { categoryId: 1, scriptIds: ['script-1-cat1'] },
          { categoryId: 2, scriptIds: ['script-2-cat2'] },
        ],
        changes: [
          { categoryId: 1, newStatus: { isSelected: false } },
          { categoryId: 2, newStatus: { isSelected: false } },
        ],
        expected: [
          { scriptId: 'script-1-cat1', newStatus: { isSelected: false } },
          { scriptId: 'script-2-cat2', newStatus: { isSelected: false } },
        ],
      },
      {
        description: 'mixed operations (select, revert, deselect)',
        categories: [
          { categoryId: 1, scriptIds: ['to-revert'] },
          { categoryId: 2, scriptIds: ['not-revert'] },
          { categoryId: 3, scriptIds: ['to-deselect'] },
        ],
        changes: [
          { categoryId: 1, newStatus: { isSelected: true, isReverted: true } },
          { categoryId: 2, newStatus: { isSelected: true, isReverted: false } },
          { categoryId: 3, newStatus: { isSelected: false } },
        ],
        expected: [
          { scriptId: 'to-revert', newStatus: { isSelected: true, isReverted: true } },
          { scriptId: 'not-revert', newStatus: { isSelected: true, isReverted: false } },
          { scriptId: 'to-deselect', newStatus: { isSelected: false } },
        ],
      },
      {
        description: 'affecting selected categories only',
        categories: [
          { categoryId: 1, scriptIds: ['relevant-1', 'relevant-2'] },
          { categoryId: 2, scriptIds: ['not-relevant-1', 'not-relevant-2'] },
          { categoryId: 3, scriptIds: ['not-relevant-3', 'not-relevant-4'] },
        ],
        changes: [
          { categoryId: 1, newStatus: { isSelected: true, isReverted: true } },
        ],
        expected: [
          { scriptId: 'relevant-1', newStatus: { isSelected: true, isReverted: true } },
          { scriptId: 'relevant-2', newStatus: { isSelected: true, isReverted: true } },
        ],
      },
    ];
    testScenarios.forEach(({
      description, changes, categories, expected,
    }) => {
      it(description, () => {
        // arrange
        const scriptSelectionStub = new ScriptSelectionStub();
        const sut = new ScriptToCategorySelectionMapperBuilder()
          .withScriptSelection(scriptSelectionStub)
          .withCollection(new CategoryCollectionStub().withAction(
            new CategoryStub(99)
              // Register scripts to test for nested items
              .withAllScriptIdsRecursively(...categories.flatMap((c) => c.scriptIds))
              .withCategories(...categories.map(
                (c) => new CategoryStub(c.categoryId).withAllScriptIdsRecursively(...c.scriptIds),
              )),
          ))
          .build();
        // act
        sut.processChanges({
          changes,
        });
        // assert
        expect(scriptSelectionStub.callHistory).to.have.lengthOf(1);
        const call = scriptSelectionStub.callHistory.find((m) => m.methodName === 'processChanges');
        expectExists(call);
        const [command] = call.args;
        const { changes: actualChanges } = (command as ScriptSelectionChangeCommand);
        expect(actualChanges).to.have.lengthOf(expected.length);
        expect(actualChanges).to.deep.members(expected);
      });
    });
  });
});

class ScriptToCategorySelectionMapperBuilder {
  private scriptSelection: ScriptSelection = new ScriptSelectionStub();

  private collection: ICategoryCollection = new CategoryCollectionStub();

  public withScriptSelection(scriptSelection: ScriptSelection): this {
    this.scriptSelection = scriptSelection;
    return this;
  }

  public withCollection(collection: ICategoryCollection): this {
    this.collection = collection;
    return this;
  }

  public build(): ScriptToCategorySelectionMapper {
    return new ScriptToCategorySelectionMapper(
      this.scriptSelection,
      this.collection,
    );
  }
}

type TestScripts = readonly [ScriptStub, ScriptStub, ScriptStub];
function setupTestWithPreselectedScripts(options: {
  preselect: (allScripts: TestScripts) => readonly ScriptStub[],
}) {
  const allScripts: TestScripts = [
    new ScriptStub('first-script'),
    new ScriptStub('second-script'),
    new ScriptStub('third-script'),
  ];
  const preselectedScripts = options.preselect(allScripts);
  const category = new CategoryStub(1)
    .withAllScriptsRecursively(...allScripts); // Register scripts to test for nested items
  const collection = new CategoryCollectionStub().withAction(category);
  const sut = new ScriptToCategorySelectionMapperBuilder()
    .withCollection(collection)
    .withScriptSelection(
      new ScriptSelectionStub()
        .withSelectedScripts(preselectedScripts.map((s) => s.toSelectedScript())),
    )
    .build();
  return {
    category,
    sut,
  };
}
