import type { CollectionData } from '@/application/collections/';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { createCategoryCollection } from '@/domain/Collection/CategoryCollectionFactory';
import type { CategoryCollectionFactory } from '@/domain/Collection/CategoryCollectionFactory';
import { createEnumParser, type EnumParser } from '../Common/Enum';
import { createTypeValidator, type TypeValidator } from '../Compiler/Common/TypeValidator';
import { parseCategory, type CategoryParser } from './Executable/CategoryParser';
import { parseScriptingDefinition, type ScriptingDefinitionCompiler } from '../Compiler/Collection/ScriptingDefinition/ScriptingDefinitionParser';
import { createCategoryCollectionContext, type CategoryCollectionContextFactory } from './Executable/CategoryCollectionContext';

export const parseCategoryCollection: CategoryCollectionParser = (
  content,
  projectDetails,
  utilities: CategoryCollectionParserUtilities = DefaultUtilities,
) => {
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

export interface CategoryCollectionParser {
  (
    content: CollectionData,
    projectDetails: ProjectDetails,
    utilities?: CategoryCollectionParserUtilities,
  ): CategoryCollection;
}

interface CategoryCollectionParserUtilities {
  readonly osParser: EnumParser<OperatingSystem>;
  readonly validator: TypeValidator;
  readonly parseScriptingDefinition: ScriptingDefinitionCompiler;
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
  createCategoryCollection,
};
