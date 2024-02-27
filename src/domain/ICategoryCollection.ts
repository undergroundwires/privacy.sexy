import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import type { IScript } from '@/domain/IScript';
import type { ICategory } from '@/domain/ICategory';

export interface ICategoryCollection {
  readonly scripting: IScriptingDefinition;
  readonly os: OperatingSystem;
  readonly totalScripts: number;
  readonly totalCategories: number;
  readonly actions: ReadonlyArray<ICategory>;

  getScriptsByLevel(level: RecommendationLevel): ReadonlyArray<IScript>;
  getCategory(categoryId: number): ICategory;
  getScript(scriptId: string): IScript;
  getAllScripts(): ReadonlyArray<IScript>;
  getAllCategories(): ReadonlyArray<ICategory>;
}
