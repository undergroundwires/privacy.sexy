import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import { ScriptSelectionStub } from '@tests/unit/shared/Stubs/ScriptSelectionStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import { UserSelectionStub } from '@tests/unit/shared/Stubs/UserSelectionStub';

export class RecommendationStatusTestScenario {
  public readonly all: readonly SelectedScript[];

  public readonly allStandard: readonly SelectedScript[];

  public readonly someStandard: readonly SelectedScript[];

  public readonly someStrict: readonly SelectedScript[];

  public readonly allStrict: readonly SelectedScript[];

  public readonly someUnrecommended: readonly SelectedScript[];

  public readonly allUnrecommended: readonly SelectedScript[];

  constructor() {
    this.someStandard = createSelectedScripts(RecommendationLevel.Standard, 'standard-some-1', 'standard-some-2');
    this.allStandard = [...this.someStandard, ...createSelectedScripts(RecommendationLevel.Standard, 'standard-all-1', 'standard-all-2')];
    this.someStrict = createSelectedScripts(RecommendationLevel.Strict, 'strict-some-1', 'strict-some-2');
    this.allStrict = [...this.someStrict, ...createSelectedScripts(RecommendationLevel.Strict, 'strict-all-1', 'strict-all-2')];
    this.someUnrecommended = createSelectedScripts(undefined, 'unrecommended-some-1', 'unrecommended-some-2');
    this.allUnrecommended = [...this.someUnrecommended, ...createSelectedScripts(undefined, 'unrecommended-all-1', 'unrecommended-all-2')];
    this.all = [...this.allStandard, ...this.allStrict, ...this.allUnrecommended];
  }

  public generateState(selectedScripts: readonly SelectedScript[] = []) {
    const allScripts = this.all.map((s) => s.script);
    const scriptSelection = new ScriptSelectionStub()
      .withSelectedScripts(selectedScripts);
    const categoryCollectionState = new CategoryCollectionStateStub(allScripts)
      .withSelection(new UserSelectionStub().withScripts(scriptSelection));
    return {
      scriptsStub: scriptSelection,
      stateStub: categoryCollectionState,
    };
  }
}

function createSelectedScripts(level?: RecommendationLevel, ...ids: string[]): SelectedScript[] {
  return ids.map((id) => new SelectedScriptStub(
    new ScriptStub(id).withLevel(level),
  ).withRevert(false));
}
