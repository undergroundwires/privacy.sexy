import type { CollectionData } from '@/application/collections/';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { CompiledCollectionDto } from '../CompiledCollectionDto';
import TypeValidator, { createTypeValidator } from '@/application/Compiler/Common/TypeValidator';

export interface SingleCollectionCompiler { //TODO: CategoryCollectionParser will become this.
  (
    collectionData: CollectionData,
    projectDetails: ProjectDetails,
    utilities?: SingleCollectionCompilerUtilities,
  ): CompiledCollectionDto;
}

interface SingleCollectionCompilerUtilities {
  readonly osParser: EnumParser<OperatingSystem>;
  readonly validator: TypeValidator;
  readonly parseScriptingDefinition: ScriptingDefinitionParser;
  readonly createContext: CategoryCollectionContextFactory;
  readonly parseCategory: CategoryParser;
  readonly createCategoryCollection: CategoryCollectionFactory;
}

export const compileCollection: SingleCollectionCompiler = (
  collectionData,
  projectDetails,
  utilities = DefaultUtilities,
) => {
  validateCollection(content, utilities.validator);
};

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

const DefaultUtilities: CategoryCollectionParserUtilities = {
  validator: createTypeValidator(),
  osParser: createEnumParser(OperatingSystem),
  parseScriptingDefinition,
  createContext: createCategoryCollectionContext,
  parseCategory,
  createCategoryCollection,
};
