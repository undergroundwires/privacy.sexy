import { IScript } from '@/domain/IScript';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { scrambledEqual } from '@/application/Common/Array';
import { ICategoryCollectionState, IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';

export enum SelectionType {
  Standard,
  Strict,
  All,
  None,
  Custom,
}

export class SelectionTypeHandler {
  constructor(private readonly state: ICategoryCollectionState) {
    if (!state) { throw new Error('missing state'); }
  }

  public selectType(type: SelectionType) {
    if (type === SelectionType.Custom) {
      throw new Error('cannot select custom type');
    }
    const selector = selectors.get(type);
    selector.select(this.state);
  }

  public getCurrentSelectionType(): SelectionType {
    for (const [type, selector] of selectors.entries()) {
      if (selector.isSelected(this.state)) {
        return type;
      }
    }
    return SelectionType.Custom;
  }
}

interface ISingleTypeHandler {
  isSelected: (state: IReadOnlyCategoryCollectionState) => boolean;
  select: (state: ICategoryCollectionState) => void;
}

const selectors = new Map<SelectionType, ISingleTypeHandler>([
  [SelectionType.None, {
    select: (state) => state.selection.deselectAll(),
    isSelected: (state) => state.selection.selectedScripts.length === 0,
  }],
  [SelectionType.Standard, getRecommendationLevelSelector(RecommendationLevel.Standard)],
  [SelectionType.Strict, getRecommendationLevelSelector(RecommendationLevel.Strict)],
  [SelectionType.All, {
    select: (state) => state.selection.selectAll(),
    isSelected: (state) => state.selection.selectedScripts.length === state.collection.totalScripts,
  }],
]);

function getRecommendationLevelSelector(level: RecommendationLevel): ISingleTypeHandler {
  return {
    select: (state) => selectOnly(level, state),
    isSelected: (state) => hasAllSelectedLevelOf(level, state),
  };
}

function hasAllSelectedLevelOf(
  level: RecommendationLevel,
  state: IReadOnlyCategoryCollectionState,
) {
  const scripts = state.collection.getScriptsByLevel(level);
  const { selectedScripts } = state.selection;
  return areAllSelected(scripts, selectedScripts);
}

function selectOnly(level: RecommendationLevel, state: ICategoryCollectionState) {
  const scripts = state.collection.getScriptsByLevel(level);
  state.selection.selectOnly(scripts);
}

function areAllSelected(
  expectedScripts: ReadonlyArray<IScript>,
  selection: ReadonlyArray<SelectedScript>,
): boolean {
  const selectedScriptIds = selection
    .filter((selected) => !selected.revert)
    .map((script) => script.id);
  if (expectedScripts.length < selectedScriptIds.length) {
    return false;
  }
  const expectedScriptIds = expectedScripts.map((script) => script.id);
  return scrambledEqual(selectedScriptIds, expectedScriptIds);
}
