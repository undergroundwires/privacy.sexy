import type { CategorySelection } from '@/application/Context/State/Selection/Category/CategorySelection';
import type { ScriptSelection } from '@/application/Context/State/Selection/Script/ScriptSelection';
import type { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import { CategorySelectionStub } from './CategorySelectionStub';
import { ScriptSelectionStub } from './ScriptSelectionStub';

export class UserSelectionStub implements UserSelection {
  public categories: CategorySelection = new CategorySelectionStub();

  public scripts: ScriptSelection = new ScriptSelectionStub();

  public withCategories(categories: CategorySelection): this {
    this.categories = categories;
    return this;
  }

  public withScripts(scripts: ScriptSelection): this {
    this.scripts = scripts;
    return this;
  }
}
