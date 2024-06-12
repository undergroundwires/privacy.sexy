import { getEnumValues, assertInRange } from '@/application/Common/Enum';
import { RecommendationLevel } from './Executables/Script/RecommendationLevel';
import { OperatingSystem } from './OperatingSystem';
import type { IEntity } from '../infrastructure/Entity/IEntity';
import type { Category } from './Executables/Category/Category';
import type { Script } from './Executables/Script/Script';
import type { IScriptingDefinition } from './IScriptingDefinition';
import type { ICategoryCollection } from './ICategoryCollection';

export class CategoryCollection implements ICategoryCollection {
  public get totalScripts(): number { return this.queryable.allScripts.length; }

  public get totalCategories(): number { return this.queryable.allCategories.length; }

  private readonly queryable: IQueryableCollection;

  constructor(
    public readonly os: OperatingSystem,
    public readonly actions: ReadonlyArray<Category>,
    public readonly scripting: IScriptingDefinition,
  ) {
    this.queryable = makeQueryable(actions);
    assertInRange(os, OperatingSystem);
    ensureValid(this.queryable);
    ensureNoDuplicates(this.queryable.allCategories);
    ensureNoDuplicates(this.queryable.allScripts);
  }

  public getCategory(categoryId: number): Category {
    const category = this.queryable.allCategories.find((c) => c.id === categoryId);
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

  public getScript(scriptId: string): Script {
    const script = this.queryable.allScripts.find((s) => s.id === scriptId);
    if (!script) {
      throw new Error(`missing script: ${scriptId}`);
    }
    return script;
  }

  public getAllScripts(): Script[] {
    return this.queryable.allScripts;
  }

  public getAllCategories(): Category[] {
    return this.queryable.allCategories;
  }
}

function ensureNoDuplicates<TKey>(entities: ReadonlyArray<IEntity<TKey>>) {
  const isUniqueInArray = (id: TKey, index: number, array: readonly TKey[]) => array
    .findIndex((otherId) => otherId === id) !== index;
  const duplicatedIds = entities
    .map((entity) => entity.id)
    .filter((id, index, array) => !isUniqueInArray(id, index, array))
    .filter(isUniqueInArray);
  if (duplicatedIds.length > 0) {
    const duplicatedIdsText = duplicatedIds.map((id) => `"${id}"`).join(',');
    throw new Error(
      `Duplicate entities are detected with following id(s): ${duplicatedIdsText}`,
    );
  }
}

interface IQueryableCollection {
  allCategories: Category[];
  allScripts: Script[];
  scriptsByLevel: Map<RecommendationLevel, readonly Script[]>;
}

function ensureValid(application: IQueryableCollection) {
  ensureValidCategories(application.allCategories);
  ensureValidScripts(application.allScripts);
}

function ensureValidCategories(allCategories: readonly Category[]) {
  if (!allCategories.length) {
    throw new Error('must consist of at least one category');
  }
}

function ensureValidScripts(allScripts: readonly Script[]) {
  if (!allScripts.length) {
    throw new Error('must consist of at least one script');
  }
  const missingRecommendationLevels = getEnumValues(RecommendationLevel)
    .filter((level) => allScripts.every((script) => script.level !== level));
  if (missingRecommendationLevels.length > 0) {
    throw new Error('none of the scripts are recommended as'
      + ` "${missingRecommendationLevels.map((level) => RecommendationLevel[level]).join(', "')}".`);
  }
}

function flattenApplication(
  categories: ReadonlyArray<Category>,
): [Category[], Script[]] {
  const [subCategories, subScripts] = (categories || [])
    // Parse children
    .map((category) => flattenApplication(category.subCategories))
    // Flatten results
    .reduce(([previousCategories, previousScripts], [currentCategories, currentScripts]) => {
      return [
        [...previousCategories, ...currentCategories],
        [...previousScripts, ...currentScripts],
      ];
    }, [new Array<Category>(), new Array<Script>()]);
  return [
    [
      ...(categories || []),
      ...subCategories,
    ],
    [
      ...(categories || []).flatMap((category) => category.scripts || []),
      ...subScripts,
    ],
  ];
}

function makeQueryable(
  actions: ReadonlyArray<Category>,
): IQueryableCollection {
  const flattened = flattenApplication(actions);
  return {
    allCategories: flattened[0],
    allScripts: flattened[1],
    scriptsByLevel: groupByLevel(flattened[1]),
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
