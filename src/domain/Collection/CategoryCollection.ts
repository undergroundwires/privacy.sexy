import { getEnumValues, assertInRange } from '@/application/Common/Enum';
import { RecommendationLevel } from '../Executables/Script/RecommendationLevel';
import { OperatingSystem } from '../OperatingSystem';
import { validateCategoryCollection } from './Validation/CompositeCategoryCollectionValidator';
import type { ExecutableId } from '../Executables/Identifiable';
import type { Category } from '../Executables/Category/Category';
import type { Script } from '../Executables/Script/Script';
import type { IScriptingDefinition } from '../IScriptingDefinition';
import type { ICategoryCollection } from './ICategoryCollection';
import type { CategoryCollectionValidator } from './Validation/CategoryCollectionValidator';

export class CategoryCollection implements ICategoryCollection {
  public readonly os: OperatingSystem;

  public readonly actions: ReadonlyArray<Category>;

  public readonly scripting: IScriptingDefinition;

  public get totalScripts(): number { return this.queryable.allScripts.length; }

  public get totalCategories(): number { return this.queryable.allCategories.length; }

  private readonly queryable: QueryableCollection;

  constructor(
    parameters: CategoryCollectionInitParameters,
    validate: CategoryCollectionValidator = validateCategoryCollection,
  ) {
    this.os = parameters.os;
    this.actions = parameters.actions;
    this.scripting = parameters.scripting;

    this.queryable = makeQueryable(this.actions);
    validate({
      allScripts: this.queryable.allScripts,
      allCategories: this.queryable.allCategories,
      operatingSystem: this.os,
    });
  }

  public getCategory(executableId: ExecutableId): Category {
    const category = this.queryable.allCategories.find((c) => c.executableId === executableId);
    if (!category) {
      throw new Error(`Missing category with ID: "${executableId}"`);
    }
    return category;
  }

  public getScriptsByLevel(level: RecommendationLevel): readonly Script[] {
    assertInRange(level, RecommendationLevel);
    const scripts = this.queryable.scriptsByLevel.get(level);
    return scripts ?? [];
  }

  public getScript(executableId: string): Script {
    const script = this.queryable.allScripts.find((s) => s.executableId === executableId);
    if (!script) {
      throw new Error(`Missing script: ${executableId}`);
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

export interface CategoryCollectionInitParameters {
  readonly os: OperatingSystem;
  readonly actions: ReadonlyArray<Category>;
  readonly scripting: IScriptingDefinition;
}

interface QueryableCollection {
  readonly allCategories: Category[];
  readonly allScripts: Script[];
  readonly scriptsByLevel: Map<RecommendationLevel, readonly Script[]>;
}

function flattenCategoryHierarchy(
  categories: ReadonlyArray<Category>,
): [Category[], Script[]] {
  const [subCategories, subScripts] = (categories || [])
    // Parse children
    .map((category) => flattenCategoryHierarchy(category.subcategories))
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
): QueryableCollection {
  const flattened = flattenCategoryHierarchy(actions);
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
