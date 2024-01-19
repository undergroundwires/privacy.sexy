import { CategorySelection, ReadonlyCategorySelection } from './Category/CategorySelection';
import { ReadonlyScriptSelection, ScriptSelection } from './Script/ScriptSelection';

export interface ReadonlyUserSelection {
  readonly categories: ReadonlyCategorySelection;
  readonly scripts: ReadonlyScriptSelection;
}

export interface UserSelection extends ReadonlyUserSelection {
  readonly categories: CategorySelection;
  readonly scripts: ScriptSelection;
}
