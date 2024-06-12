import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { Script } from '@/domain/Executables/Script/Script';
import type { Category } from '@/domain/Executables/Category/Category';

export interface ICategoryCollection {
  readonly scripting: IScriptingDefinition;
  readonly os: OperatingSystem;
  readonly totalScripts: number;
  readonly totalCategories: number;
  readonly actions: ReadonlyArray<Category>;

  getScriptsByLevel(level: RecommendationLevel): ReadonlyArray<Script>;
  getCategory(categoryId: number): Category;
  getScript(scriptId: string): Script;
  getAllScripts(): ReadonlyArray<Script>;
  getAllCategories(): ReadonlyArray<Category>;
}
