import { assertInRange, getEnumValues } from '@/application/Common/Enum';
import { RecommendationLevel } from '../Executables/Script/RecommendationLevel';
import { validateCategoryCollection } from './Validation/CompositeCategoryCollectionValidator';
import type { Category } from '../Executables/Category/Category';
import type { ScriptingDefinition } from '../ScriptingDefinition';
import type { OperatingSystem } from '../OperatingSystem';
import type { CategoryCollection } from './CategoryCollection';
import type { CategoryCollectionValidator } from './Validation/CategoryCollectionValidator';
import type { Script } from '../Executables/Script/Script';

export type CategoryCollectionFactory = (
  parameters: CategoryCollectionInitParameters,
  validate?: CategoryCollectionValidator,
) => CategoryCollection;

export interface CategoryCollectionInitParameters {
  readonly os: OperatingSystem;
  readonly actions: readonly Category[];
  readonly scripting: ScriptingDefinition;
}

export const createCategoryCollection: CategoryCollectionFactory = (
  parameters,
  validate: CategoryCollectionValidator = validateCategoryCollection,
) => {
  const queryable = makeQueryable(parameters.actions);
  validate({
    allScripts: queryable.allScripts,
    allCategories: queryable.allCategories,
    operatingSystem: parameters.os,
  });
  return {
    os: parameters.os,
    actions: parameters.actions,
    scripting: parameters.scripting,
    totalCategories: queryable.allCategories.length,
    totalScripts: queryable.allScripts.length,
    getAllScripts: () => queryable.allScripts,
    getAllCategories: () => queryable.allCategories,
    getCategory: (executableId) => {
      const category = queryable.allCategories.find((c) => c.executableId === executableId);
      if (!category) {
        throw new Error(`Missing category with ID: "${executableId}"`);
      }
      return category;
    },
    getScriptsByLevel: (level) => {
      assertInRange(level, RecommendationLevel);
      return queryable.scriptsByLevel.get(level) ?? [];
    },
    getScript: (executableId) => {
      const script = queryable.allScripts.find((s) => s.executableId === executableId);
      if (!script) {
        throw new Error(`Missing script: ${executableId}`);
      }
      return script;
    },
  };
};

interface QueryableCollection {
  readonly allCategories: Category[];
  readonly allScripts: Script[];
  readonly scriptsByLevel: Map<RecommendationLevel, readonly Script[]>;
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
