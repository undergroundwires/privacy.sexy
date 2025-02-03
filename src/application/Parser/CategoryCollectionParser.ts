import type { CollectionData } from '@/application/collections/';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { createCategoryCollection, type CategoryCollectionFactory } from '@/domain/Collection/CategoryCollectionFactory';
import { createEnumParser, type EnumParser } from '../Common/Enum';
import { parseCategory, type CategoryParser } from './Executable/CategoryParser';
import { parseScriptMetadata, type ScriptMetadataParser } from './ScriptMetadata/ScriptMetadataParser';
import { createTypeValidator, type TypeValidator } from './Common/TypeValidator';
import { createCategoryCollectionContext, type CategoryCollectionContextFactory } from './Executable/CategoryCollectionContext';

export const parseCategoryCollection: CategoryCollectionParser = (
  content,
  projectDetails,
  utilities: CategoryCollectionParserUtilities = DefaultUtilities,
) => {
  validateCollection(content, utilities.validator);
  const scriptMetadata = utilities.parseScriptMetadata(content.scripting, projectDetails);
  const collectionContext = utilities.createContext(content.functions, scriptMetadata.language);
  const categories = content.actions.map(
    (action) => utilities.parseCategory(action, collectionContext),
  );
  const os = utilities.osParser.parseEnum(content.os, 'os');
  const collection = utilities.createCategoryCollection({
    os, actions: categories, scriptMetadata,
  });
  return collection;
};

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
  readonly parseScriptMetadata: ScriptMetadataParser;
  readonly createContext: CategoryCollectionContextFactory;
  readonly parseCategory: CategoryParser;
  readonly createCategoryCollection: CategoryCollectionFactory;
}

const DefaultUtilities: CategoryCollectionParserUtilities = {
  osParser: createEnumParser(OperatingSystem),
  validator: createTypeValidator(),
  parseScriptMetadata,
  createContext: createCategoryCollectionContext,
  parseCategory,
  createCategoryCollection,
};
