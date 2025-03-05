import { OperatingSystem } from '@/domain/OperatingSystem';
import type { ScriptMetadata } from '@/domain/ScriptMetadata/ScriptMetadata';
import type { Script } from '@/domain/Executables/Script/Script';
import type { Category } from '@/domain/Executables/Category/Category';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
import { ScriptStub } from './ScriptStub';
import { ScriptMetadataStub } from './ScriptMetadataStub';
import { CategoryStub } from './CategoryStub';

export class CategoryCollectionStub implements CategoryCollection {
  public scriptMetadata: ScriptMetadata = new ScriptMetadataStub();

  public os = OperatingSystem.Linux;

  public initialScript: Script = new ScriptStub('55');

  public totalScripts = 0;

  public totalCategories = 0;

  public readonly actions = new Array<Category>();

  public withSomeActions(): this {
    this.withAction(new CategoryStub(`[${CategoryCollectionStub}]-action-1`));
    this.withAction(new CategoryStub(`[${CategoryCollectionStub}]-action-2`));
    this.withAction(new CategoryStub(`[${CategoryCollectionStub}]-action-3`));
    return this;
  }

  public withAction(category: Category): this {
    this.actions.push(category);
    return this;
  }

  public withActions(...actions: readonly Category[]): this {
    for (const action of actions) {
      this.withAction(action);
    }
    return this;
  }

  public withOs(os: OperatingSystem): this {
    this.os = os;
    return this;
  }

  public withScriptMetadata(scriptMetadata: ScriptMetadata): this {
    this.scriptMetadata = scriptMetadata;
    return this;
  }

  public withInitialScript(script: Script): this {
    this.initialScript = script;
    return this;
  }

  public withTotalScripts(totalScripts: number): this {
    this.totalScripts = totalScripts;
    return this;
  }

  public getCategory(categoryId: ExecutableId): Category {
    return this.getAllCategories()
      .find((category) => category.executableId === categoryId)
      ?? new CategoryStub(categoryId);
  }

  public getScriptsByLevel(level: RecommendationLevel): readonly Script[] {
    return this.getAllScripts()
      .filter((script) => script.level !== undefined && script.level <= level);
  }

  public getScript(executableId: ExecutableId): Script {
    return this.getAllScripts()
      .find((script) => executableId === script.executableId)
      ?? new ScriptStub(executableId);
  }

  public getAllScripts(): ReadonlyArray<Script> {
    return this.actions.flatMap((category) => getScriptsRecursively(category));
  }

  public getAllCategories(): ReadonlyArray<Category> {
    return this.actions.flatMap(
      (category) => [category, ...getSubCategoriesRecursively(category)],
    );
  }
}

function getSubCategoriesRecursively(category: Category): ReadonlyArray<Category> {
  return (category.subcategories || []).flatMap(
    (subCategory) => [subCategory, ...getSubCategoriesRecursively(subCategory)],
  );
}

function getScriptsRecursively(category: Category): ReadonlyArray<Script> {
  return [
    ...(category.scripts || []),
    ...(category.subcategories || []).flatMap(
      (subCategory) => getScriptsRecursively(subCategory),
    ),
  ];
}
