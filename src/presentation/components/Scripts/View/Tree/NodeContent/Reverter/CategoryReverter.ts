import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IUserSelection } from '@/application/Context/State/Selection/IUserSelection';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { getCategoryId } from '../../TreeViewAdapter/CategoryNodeMetadataConverter';
import { IReverter } from './IReverter';
import { ScriptReverter } from './ScriptReverter';

export class CategoryReverter implements IReverter {
  private readonly categoryId: number;

  private readonly scriptReverters: ReadonlyArray<ScriptReverter>;

  constructor(nodeId: string, collection: ICategoryCollection) {
    this.categoryId = getCategoryId(nodeId);
    this.scriptReverters = getAllSubScriptReverters(this.categoryId, collection);
  }

  public getState(selectedScripts: ReadonlyArray<SelectedScript>): boolean {
    return this.scriptReverters.every((script) => script.getState(selectedScripts));
  }

  public selectWithRevertState(newState: boolean, selection: IUserSelection): void {
    selection.addOrUpdateAllInCategory(this.categoryId, newState);
  }
}

function getAllSubScriptReverters(categoryId: number, collection: ICategoryCollection) {
  const category = collection.getCategory(categoryId);
  const scripts = category.getAllScriptsRecursively();
  return scripts.map((script) => new ScriptReverter(script.id));
}
