import type { Script } from '@/domain/Executables/Script/Script';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import { scrambledEqual } from '@/application/Common/Array';
<<<<<<< HEAD
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
=======
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
import type { ReadonlyScriptSelection, ScriptSelection } from '@/application/Context/State/Selection/Script/ScriptSelection';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { RecommendationStatusType } from './RecommendationStatusType';

export function setCurrentRecommendationStatus(
  type: RecommendationStatusType,
  context: SelectionMutationContext,
) {
  if (type === RecommendationStatusType.Custom) {
    throw new Error('Cannot select custom type.');
  }
  const selector = selectors.get(type);
  if (!selector) {
    throw new Error(`Cannot handle the type: ${RecommendationStatusType[type]}`);
  }
  selector.select(context);
}

export function getCurrentRecommendationStatus(
  context: SelectionCheckContext,
): RecommendationStatusType {
  for (const [type, selector] of selectors.entries()) {
    if (selector.isSelected(context)) {
      return type;
    }
  }
  return RecommendationStatusType.Custom;
}

export interface SelectionCheckContext {
  readonly selection: ReadonlyScriptSelection;
  readonly collection: CategoryCollection;
}

export interface SelectionMutationContext {
  readonly selection: ScriptSelection,
  readonly collection: CategoryCollection,
}

interface RecommendationStatusTypeHandler {
  isSelected: (context: SelectionCheckContext) => boolean;
  select: (context: SelectionMutationContext) => void;
}

const selectors = new Map<RecommendationStatusType, RecommendationStatusTypeHandler>([
  [RecommendationStatusType.None, {
    select: ({ selection }) => selection.deselectAll(),
    isSelected: ({ selection }) => selection.selectedScripts.length === 0,
  }],
  [RecommendationStatusType.Standard, getRecommendationLevelSelector(RecommendationLevel.Standard)],
  [RecommendationStatusType.Strict, getRecommendationLevelSelector(RecommendationLevel.Strict)],
  [RecommendationStatusType.All, {
    select: ({ selection }) => selection.selectAll(),
    isSelected: (
      { selection, collection },
    ) => selection.selectedScripts.length === collection.totalScripts,
  }],
]);

function getRecommendationLevelSelector(
  level: RecommendationLevel,
): RecommendationStatusTypeHandler {
  return {
    select: (context) => selectOnly(level, context),
    isSelected: (context) => hasAllSelectedLevelOf(level, context),
  };
}

function hasAllSelectedLevelOf(
  level: RecommendationLevel,
  context: SelectionCheckContext,
): boolean {
  const { collection, selection } = context;
  const scripts = collection.getScriptsByLevel(level);
  const { selectedScripts } = selection;
  return areAllSelected(scripts, selectedScripts);
}

function selectOnly(
  level: RecommendationLevel,
  context: SelectionMutationContext,
): void {
  const { collection, selection } = context;
  const scripts = collection.getScriptsByLevel(level);
  selection.selectOnly(scripts);
}

function areAllSelected(
  expectedScripts: ReadonlyArray<Script>,
  selection: ReadonlyArray<SelectedScript>,
): boolean {
  const selectedScriptIds = selection
    .filter((selected) => !selected.revert)
    .map((script) => script.key);
  if (expectedScripts.length < selectedScriptIds.length) {
    return false;
  }
<<<<<<< HEAD
  const expectedScriptIds = expectedScripts.map((script) => script.executableId);
=======
  const expectedScriptIds = expectedScripts.map((script) => script.key);
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
  return scrambledEqual(selectedScriptIds, expectedScriptIds);
}
