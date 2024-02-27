import type { ICategoryCollection } from '@/domain/ICategoryCollection';
import { ScriptToCategorySelectionMapper } from './Category/ScriptToCategorySelectionMapper';
import { DebouncedScriptSelection } from './Script/DebouncedScriptSelection';
import type { CategorySelection } from './Category/CategorySelection';
import type { ScriptSelection } from './Script/ScriptSelection';
import type { UserSelection } from './UserSelection';
import type { SelectedScript } from './Script/SelectedScript';

export class UserSelectionFacade implements UserSelection {
  public readonly categories: CategorySelection;

  public readonly scripts: ScriptSelection;

  constructor(
    collection: ICategoryCollection,
    selectedScripts: readonly SelectedScript[],
    scriptsFactory = DefaultScriptsFactory,
    categoriesFactory = DefaultCategoriesFactory,
  ) {
    this.scripts = scriptsFactory(collection, selectedScripts);
    this.categories = categoriesFactory(this.scripts, collection);
  }
}

export type ScriptsFactory = (
  ...params: ConstructorParameters<typeof DebouncedScriptSelection>
) => ScriptSelection;

const DefaultScriptsFactory: ScriptsFactory = (
  ...params
) => new DebouncedScriptSelection(...params);

export type CategoriesFactory = (
  ...params: ConstructorParameters<typeof ScriptToCategorySelectionMapper>
) => CategorySelection;

const DefaultCategoriesFactory: CategoriesFactory = (
  ...params
) => new ScriptToCategorySelectionMapper(...params);
