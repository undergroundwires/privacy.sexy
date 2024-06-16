import type { CategorySelectionChange, CategorySelectionStatus } from '@/application/Context/State/Selection/Category/CategorySelectionChange';
import type { ScriptSelectionChange } from '@/application/Context/State/Selection/Script/ScriptSelectionChange';
import type { ExecutableId, ExecutableKey } from '@/domain/Executables/Identifiable/ExecutableKey/ExecutableKey';
import { createKeyStubFromId } from '@tests/unit/shared/Stubs/ExecutableKeyStub';

export function buildTestScenarioData(scenario: CategoryChangeProcessingTestScenario) {
  const categoriesWithKeys: CategoryDefinitionsWithKeys = scenario.initialCategorySetup.map(
    (c): CategoryDefinitionWithKeys => ({
      categoryKey: createKeyStubFromId(c.categoryId),
      scriptKeys: c.scriptIds.map((id) => createKeyStubFromId(id)),
    }),
  );
  const actualCategoryChanges = scenario.doCategoryChanges({
    initialCategories: categoriesWithKeys,
    changeStatusOfAllCategories: (
      newStatus,
    ) => changeStatusOfAllCategories(categoriesWithKeys, newStatus),
  });
  const expectedScriptChanges = scenario.expectScriptChanges({
    initialCategories: categoriesWithKeys,
    expectSameStatusFromAllScripts: (
      newStatus,
    ) => expectSameStatusFromAllScripts(categoriesWithKeys, newStatus),
  });
  return {
    actualCategoryChanges,
    expectedScriptChanges,
    categoriesWithKeys,
  };
}

interface CategoryDefinitionWithIds {
  readonly categoryId: ExecutableId;
  readonly scriptIds: readonly ExecutableId[];
}

interface CategoryDefinitionWithKeys {
  readonly categoryKey: ExecutableKey;
  readonly scriptKeys: readonly ExecutableKey[];
}

type CategoryDefinitionsWithKeys = readonly CategoryDefinitionWithKeys[];

function changeStatusOfAllCategories(
  categories: CategoryDefinitionsWithKeys,
  newStatus: CategorySelectionStatus,
): CategorySelectionChange[] {
  return categories.map((c) => ({
    categoryKey: c.categoryKey,
    newStatus,
  }));
}

function expectSameStatusFromAllScripts(
  categories: CategoryDefinitionsWithKeys,
  newStatus: CategorySelectionStatus,
): ScriptSelectionChange[] {
  return categories.flatMap((c) => c.scriptKeys.map((scriptKey) => ({
    scriptKey, newStatus,
  })));
}

export interface CategoryChangeProcessingTestScenario {
  readonly description: string;
  readonly initialCategorySetup: readonly CategoryDefinitionWithIds[];
  readonly doCategoryChanges: (context: {
    initialCategories: CategoryDefinitionsWithKeys;
    changeStatusOfAllCategories(newStatus: CategorySelectionStatus): CategorySelectionChange[];
  }) => readonly CategorySelectionChange[];
  readonly expectScriptChanges: (context: {
    initialCategories: CategoryDefinitionsWithKeys;
    expectSameStatusFromAllScripts(newStatus: CategorySelectionStatus): ScriptSelectionChange[];
  }) => readonly ScriptSelectionChange[];
}
