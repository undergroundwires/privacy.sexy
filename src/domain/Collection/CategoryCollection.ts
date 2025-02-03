import type { ScriptMetadata } from '@/domain/ScriptMetadata/ScriptMetadata';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { Script } from '@/domain/Executables/Script/Script';
import type { Category } from '@/domain/Executables/Category/Category';
import type { ExecutableId } from '../Executables/Identifiable';

export interface CategoryCollection {
  readonly scriptMetadata: ScriptMetadata;
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
