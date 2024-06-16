import { CategoryCollectionKey } from '@/domain/Collection/CategoryCollectionKey';
import { RecommendationLevel } from '../Executables/Script/RecommendationLevel';
import { OperatingSystem } from '../OperatingSystem';
import type { ExecutableId, Identifiable } from '../Executables/Identifiable/Identifiable';
import type { Category } from '../Executables/Category/Category';
import type { Script } from '../Executables/Script/Script';
import type { IScriptingDefinition } from '../IScriptingDefinition';

export interface CategoryCollection extends Identifiable<CategoryCollectionKey> {
  readonly scripting: IScriptingDefinition;
  readonly os: OperatingSystem;
  readonly totalScripts: number;
  readonly totalCategories: number;
  readonly actions: ReadonlyArray<Category>;

  getScriptsByLevel(level: RecommendationLevel): ReadonlyArray<Script>;
  getCategory(categoryId: ExecutableId): Category;
  getScript(scriptId: ExecutableId): Script;
  getAllScripts(): ReadonlyArray<Script>;
  getAllCategories(): ReadonlyArray<Category>;
}
