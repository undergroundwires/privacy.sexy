import type { CollectionData } from '@/application/collections/';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { createCategoryCollection, type CategoryCollectionFactory } from '@/domain/Collection/CategoryCollectionFactory';
import { createEnumParser, type EnumParser } from '@/application/Common/Enum';
import { createTypeValidator, type TypeValidator } from '@/application/Common/TypeValidator';
import { parseCategory, type CategoryParser } from './Executable/CategoryParser';
import { parseScriptMetadata, type ScriptMetadataParser } from './ScriptMetadata/ScriptMetadataParser';
import { createCategoryCollectionContext, type CategoryCollectionContextFactory } from './Executable/CategoryCollectionContext';

export const compileCollection: CollectionCompiler = (
  content,
  projectDetails,
  utilities: CollectionCompilerUtilities = DefaultUtilities,
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

export interface CollectionCompiler {
  (
    content: CollectionData,
    projectDetails: ProjectDetails,
    utilities?: CollectionCompilerUtilities,
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

interface CollectionCompilerUtilities {
  readonly osParser: EnumParser<OperatingSystem>;
  readonly validator: TypeValidator;
  readonly parseScriptMetadata: ScriptMetadataParser;
  readonly createContext: CategoryCollectionContextFactory;
  readonly parseCategory: CategoryParser;
  readonly createCategoryCollection: CategoryCollectionFactory;
}

const DefaultUtilities: CollectionCompilerUtilities = {
  osParser: createEnumParser(OperatingSystem),
  validator: createTypeValidator(),
  parseScriptMetadata,
  createContext: createCategoryCollectionContext,
  parseCategory,
  createCategoryCollection,
};
