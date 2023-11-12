import { getEnumValues, assertInRange } from '@/application/Common/Enum';
import { IEntity } from '../infrastructure/Entity/IEntity';
import { ICategory } from './ICategory';
import { IScript } from './IScript';
import { RecommendationLevel } from './RecommendationLevel';
import { OperatingSystem } from './OperatingSystem';
import { IScriptingDefinition } from './IScriptingDefinition';
import { ICategoryCollection } from './ICategoryCollection';

export class CategoryCollection implements ICategoryCollection {
  public get totalScripts(): number { return this.queryable.allScripts.length; }

  public get totalCategories(): number { return this.queryable.allCategories.length; }

  private readonly queryable: IQueryableCollection;

  constructor(
    public readonly os: OperatingSystem,
    public readonly actions: ReadonlyArray<ICategory>,
    public readonly scripting: IScriptingDefinition,
  ) {
    this.queryable = makeQueryable(actions);
    assertInRange(os, OperatingSystem);
    ensureValid(this.queryable);
    ensureNoDuplicates(this.queryable.allCategories);
    ensureNoDuplicates(this.queryable.allScripts);
  }

  public getCategory(categoryId: number): ICategory {
    const category = this.queryable.allCategories.find((c) => c.id === categoryId);
    if (!category) {
      throw new Error(`Missing category with ID: "${categoryId}"`);
    }
    return category;
  }

  public getScriptsByLevel(level: RecommendationLevel): readonly IScript[] {
    assertInRange(level, RecommendationLevel);
    const scripts = this.queryable.scriptsByLevel.get(level);
    return scripts ?? [];
  }

  public getScript(scriptId: string): IScript {
    const script = this.queryable.allScripts.find((s) => s.id === scriptId);
    if (!script) {
      throw new Error(`missing script: ${scriptId}`);
    }
    return script;
  }

  public getAllScripts(): IScript[] {
    return this.queryable.allScripts;
  }

  public getAllCategories(): ICategory[] {
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
  allCategories: ICategory[];
  allScripts: IScript[];
  scriptsByLevel: Map<RecommendationLevel, readonly IScript[]>;
}

function ensureValid(application: IQueryableCollection) {
  ensureValidCategories(application.allCategories);
  ensureValidScripts(application.allScripts);
}

function ensureValidCategories(allCategories: readonly ICategory[]) {
  if (!allCategories.length) {
    throw new Error('must consist of at least one category');
  }
}

function ensureValidScripts(allScripts: readonly IScript[]) {
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
  categories: ReadonlyArray<ICategory>,
): [ICategory[], IScript[]] {
  const [subCategories, subScripts] = (categories || [])
    // Parse children
    .map((category) => flattenApplication(category.subCategories))
    // Flatten results
    .reduce(([previousCategories, previousScripts], [currentCategories, currentScripts]) => {
      return [
        [...previousCategories, ...currentCategories],
        [...previousScripts, ...currentScripts],
      ];
    }, [new Array<ICategory>(), new Array<IScript>()]);
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
  actions: ReadonlyArray<ICategory>,
): IQueryableCollection {
  const flattened = flattenApplication(actions);
  return {
    allCategories: flattened[0],
    allScripts: flattened[1],
    scriptsByLevel: groupByLevel(flattened[1]),
  };
}

function groupByLevel(
  allScripts: readonly IScript[],
): Map<RecommendationLevel, readonly IScript[]> {
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
    }, new Map<RecommendationLevel, readonly IScript[]>());
}
