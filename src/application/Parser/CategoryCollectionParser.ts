import type { CollectionData } from '@/application/collections/';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { createEnumParser, type EnumParser } from '../Common/Enum';
import { parseCategory, type CategoryParser } from './Executable/CategoryParser';
import { parseScriptingDefinition, type ScriptingDefinitionParser } from './ScriptingDefinition/ScriptingDefinitionParser';
import { createTypeValidator, type TypeValidator } from './Common/TypeValidator';
import { createCategoryCollectionContext, type CategoryCollectionContextFactory } from './Executable/CategoryCollectionContext';

export const parseCategoryCollection: CategoryCollectionParser = (
  content,
  projectDetails,
  utilities: CategoryCollectionParserUtilities = DefaultUtilities,
) => {
  validateCollection(content, utilities.validator);
  const scripting = utilities.parseScriptingDefinition(content.scripting, projectDetails);
  const collectionContext = utilities.createContext(content.functions, scripting.language);
  const categories = content.actions.map(
    (action) => utilities.parseCategory(action, collectionContext),
  );
  const os = utilities.osParser.parseEnum(content.os, 'os');
  const collection = utilities.createCategoryCollection({
    os, actions: categories, scripting,
  });
  return collection;
};

export type CategoryCollectionFactory = (
  ...parameters: ConstructorParameters<typeof CategoryCollection>
) => ICategoryCollection;

export interface CategoryCollectionParser {
  (
    content: CollectionData,
    projectDetails: ProjectDetails,
    utilities?: CategoryCollectionParserUtilities,
  ): ICategoryCollection;
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
  readonly createContext: CategoryCollectionContextFactory;
  readonly parseCategory: CategoryParser;
  readonly createCategoryCollection: CategoryCollectionFactory;
}

const DefaultUtilities: CategoryCollectionParserUtilities = {
  osParser: createEnumParser(OperatingSystem),
  validator: createTypeValidator(),
  parseScriptingDefinition,
  createContext: createCategoryCollectionContext,
  parseCategory,
  createCategoryCollection: (...args) => new CategoryCollection(...args),
};
