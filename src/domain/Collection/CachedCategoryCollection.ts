import { getEnumValues, assertInRange } from '@/application/Common/Enum';
import type { Category } from '@/domain/Executables/Category/Category';
import type { ExecutableId, ExecutableKey } from '@/domain/Executables/Identifiable/ExecutableKey/ExecutableKey';
import { RecommendationLevel } from '../Executables/Script/RecommendationLevel';
import { OperatingSystem } from '../OperatingSystem';
import type { IScriptingDefinition } from '../IScriptingDefinition';
import type { Executable } from '../Executables/Executable';
import type { CategoryCollection } from './CategoryCollection';
import type { CategoryCollectionKey } from './Key/CategoryCollectionKey';
import type { Script } from '../Executables/Script/Script';

// TODO: Requires unit tests

export class CachedCategoryCollection implements CategoryCollection { // TODO: Best name possible "Cached"?
  public readonly actions: ReadonlyArray<Category>;

  public readonly scripting: IScriptingDefinition;

  public get totalScripts(): number { return this.queryable.allScripts.length; }

  public get totalCategories(): number { return this.queryable.allCategories.length; }

  public get os(): OperatingSystem { return this.key.os; }

  private readonly queryable: PerformantQueryableCollection;

  private readonly key: CategoryCollectionKey;

  constructor(
    parameters: CategoryCollectionInitParameters,
  ) {
    this.key = parameters.key;
    this.actions = parameters.actions;
    this.scripting = parameters.scripting;

    this.queryable = makeQueryable(this.actions);
    try {
      ensureValidCollection(this.queryable);
      ensureNoDuplicates(this.queryable.allExecutables);
      // TODO: Ensure no executable where collection key is not equal to this collection key
    } catch (error) {
      throw Error([ // TODO: Unit test this
        `Collection key: "${this.key.createSerializedKey()}".`,
        error.message,
      ].join('\n'));
    }
  }

  public getCategory(categoryId: ExecutableId): Category {
    const category = this.queryable.allCategoriesById.get(categoryId);
    if (!category) {
      throw new Error(`Missing category with ID: "${categoryId}"`);
    }
    return category;
  }

  public getScriptsByLevel(level: RecommendationLevel): readonly Script[] {
    assertInRange(level, RecommendationLevel);
    const scripts = this.queryable.scriptsByLevel.get(level);
    return scripts ?? [];
  }

  public getScript(scriptId: ExecutableId): Script {
    const script = this.queryable.allScriptsById.get(scriptId);
    if (!script) {
      throw new Error(`missing script: ${scriptId}`);
    }
    return script;
  }

  public getAllScripts(): readonly Script[] {
    return this.queryable.allScripts;
  }

  public getAllCategories(): readonly Category[] {
    return this.queryable.allCategories;
  }
}

export interface CategoryCollectionInitParameters {
  readonly key: CategoryCollectionKey;
  readonly actions: ReadonlyArray<Category>;
  readonly scripting: IScriptingDefinition;
}

function ensureNoDuplicates(executables: ReadonlyArray<Executable>) {
  const isUniqueInArray = (
    key: ExecutableKey,
    index: number,
    array: readonly ExecutableKey[],
  ) => array.findIndex((otherKey) => otherKey.equals(key)) !== index;
  const duplicatedIds = executables
    .map((entity) => entity.key)
    .filter((key, index, array) => !isUniqueInArray(key, index, array))
    .filter(isUniqueInArray);
  if (duplicatedIds.length > 0) {
    const duplicatedIdsText = duplicatedIds.map((key) => `"${key}"`).join(',');
    throw new Error(
      `Duplicate entities are detected with following id(s): ${duplicatedIdsText}`,
    );
  }
}

interface PerformantQueryableCollection {
  readonly allCategoriesById: Map<ExecutableId, Category>;
  readonly allScriptsById: Map<ExecutableId, Script>;
  readonly allCategories: readonly Category[];
  readonly allScripts: readonly Script[];
  readonly allExecutables: Executable[];
  readonly scriptsByLevel: Map<RecommendationLevel, readonly Script[]>;
}

function ensureValidCollection(application: PerformantQueryableCollection) {
  ensureValidCategories(application.allCategories);
  ensureValidScripts(application.allScripts);
}

function ensureValidCategories(allCategories: readonly Category[]) {
  if (!allCategories.length) {
    throw new Error('A collection must consist of at least one category');
  }
}

function ensureValidScripts(allScripts: readonly Script[]) {
  if (!allScripts.length) {
    throw new Error('A collection must consist of at least one script');
  }
  const missingRecommendationLevels = getEnumValues(RecommendationLevel)
    .filter((level) => allScripts.every((script) => script.level !== level));
  if (missingRecommendationLevels.length > 0) {
    throw new Error('None of the scripts in collection are recommended as'
      + ` "${missingRecommendationLevels.map((level) => RecommendationLevel[level]).join(', "')}".`);
  }
}

function flattenApplication(
  categories: ReadonlyArray<Category>,
): {
    readonly categories: readonly Category[];
    readonly scripts: readonly Script[];
  } {
  const [subcategories, subscripts] = (categories || [])
    // Parse children
    .map((category) => flattenApplication(category.subcategories))
    // Flatten results
    .reduce((
      [previousCategories, previousScripts],
      { categories: currentCategories, scripts: currentScripts },
    ) => {
      return [
        [...previousCategories, ...currentCategories],
        [...previousScripts, ...currentScripts],
      ];
    }, [new Array<Category>(), new Array<Script>()]);
  return {
    categories: [
      ...(categories || []),
      ...subcategories,
    ],
    scripts: [
      ...(categories || []).flatMap((category) => category.scripts || []),
      ...subscripts,
    ],
  };
}

function makeQueryable(
  actions: ReadonlyArray<Category>,
): PerformantQueryableCollection {
  const { categories, scripts } = flattenApplication(actions);
  return {
    allCategoriesById: new Map(categories.map((c) => [c.key.executableId, c])),
    allScriptsById: new Map(scripts.map((s) => [s.key.executableId, s])),
    allCategories: categories,
    allScripts: scripts,
    allExecutables: [...scripts, ...categories],
    scriptsByLevel: groupByLevel(scripts),
  };
}

function groupByLevel(
  allScripts: readonly Script[],
): Map<RecommendationLevel, readonly Script[]> {
  return getEnumValues(RecommendationLevel)
    .map((level) => ({
      level,
      scripts: allScripts.filter(
        (script) => script.level !== undefined && script.level <= level,
      ),
    }))
    .reduce((map, group) => {
      map.set(group.level, group.scripts);
      return map;
    }, new Map<RecommendationLevel, readonly Script[]>());
}
