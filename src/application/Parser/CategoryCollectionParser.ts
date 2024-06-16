import type { CollectionData } from '@/application/collections/';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { OsCategoryCollectionKey } from '@/domain/Collection/Key/OsCategoryCollectionKey';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { CachedCategoryCollection } from '@/domain/Collection/CachedCategoryCollection';
import { createEnumParser, type EnumParser } from '../Common/Enum';
import { parseCategory, type CategoryParser } from './Executable/CategoryParser';
import { parseScriptingDefinition, type ScriptingDefinitionParser } from './ScriptingDefinition/ScriptingDefinitionParser';
import { createTypeValidator, type TypeValidator } from './Common/TypeValidator';
import { createCollectionUtilities, type CategoryCollectionSpecificUtilitiesFactory } from './Executable/CategoryCollectionSpecificUtilities';

export const parseCategoryCollection: CategoryCollectionParser = (
  content,
  projectDetails,
  utilities: CategoryCollectionParserUtilities = DefaultUtilities,
) => {
  validateCollection(content, utilities.validator);
  const os = utilities.osParser.parseEnum(content.os, 'os');
  const collectionKey = new OsCategoryCollectionKey(os); // TODO: To utilities
  const scripting = utilities.parseScriptingDefinition(content.scripting, projectDetails);
  const collectionUtilities = utilities.createUtilities(collectionKey, content.functions, scripting);
  const categories = content.actions.map(
    (action) => utilities.parseCategory(action, collectionUtilities),
  );
  const collection = utilities.createCategoryCollection({
    key: collectionKey, actions: categories, scripting,
  });
  return collection;
};

export type CategoryCollectionFactory = (
  ...parameters: ConstructorParameters<typeof CachedCategoryCollection>
) => CategoryCollection;

export interface CategoryCollectionParser {
  (
    content: CollectionData,
    projectDetails: ProjectDetails,
    utilities?: CategoryCollectionParserUtilities,
  ): CategoryCollection;
}

function validateCollection(
  content: CollectionData,
  validator: TypeValidator,
): void {
  validator.assertObject({
    value: content,
    valueName: 'Collection',
    allowedProperties: [
      'os', 'scripting', 'actions', 'functions',
    ],
  });
  validator.assertNonEmptyCollection({
    value: content.actions,
    valueName: '\'actions\' in collection',
  });
}

interface CategoryCollectionParserUtilities {
  readonly osParser: EnumParser<OperatingSystem>;
  readonly validator: TypeValidator;
  readonly parseScriptingDefinition: ScriptingDefinitionParser;
  readonly createUtilities: CategoryCollectionSpecificUtilitiesFactory;
  readonly parseCategory: CategoryParser;
  readonly createCategoryCollection: CategoryCollectionFactory;
}

const DefaultUtilities: CategoryCollectionParserUtilities = {
  osParser: createEnumParser(OperatingSystem),
  validator: createTypeValidator(),
  parseScriptingDefinition,
  createUtilities: createCollectionUtilities,
  parseCategory,
  createCategoryCollection: (...args) => new CachedCategoryCollection(...args),
};
