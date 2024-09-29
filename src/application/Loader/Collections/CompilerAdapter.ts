import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { createCategoryCollection, type CategoryCollectionFactory } from '@/domain/Collection/CategoryCollectionFactory';
import type { ScriptingDefinition } from '@/domain/ScriptingDefinition';
import { createScriptingDefinition, type ScriptingDefinitionFactory } from '@/domain/ScriptingDefinitionFactory';
import { createCategory, type CategoryFactory } from '@/domain/Executables/Category/CategoryFactory';
import type { Category } from '@/domain/Executables/Category/Category';
import { createScript, type ScriptFactory } from '@/domain/Executables/Script/ScriptFactory';
import type { CompiledCollectionDto } from '../../Compiler/CompiledCollectionDto';
import type { Script } from '@/domain/Executables/Script/Script';

/*
* This module implements the Adapter pattern to convert between the Compiler's
* Data Transfer Objects (DTOs) and the domain model.
*
* It serves as an anti-corruption layer between the compiler and the domain layer,
* allowing each to evolve independently.
*/

export interface CompilerAdapter {
  (
    compiledCollections: readonly CompiledCollectionDto[],
    utilities?: ConverterUtilities,
  ): CategoryCollection[];
}

interface ConverterUtilities {
  readonly createCategoryCollection: CategoryCollectionFactory;
  readonly createScriptingDefinition: ScriptingDefinitionFactory;
  readonly createCategory: CategoryFactory;
  readonly createScript: ScriptFactory;
}

export const convertToCategoryCollections: CompilerAdapter = (
  collections,
  utilities = DefaultUtilities,
) => {
  return collections.map(
    (collection) => convertToCategoryCollection(collection, utilities),
  );
};

const DefaultUtilities: ConverterUtilities = {
  createCategoryCollection,
  createScriptingDefinition,
  createCategory,
  createScript,
};

function convertToCategoryCollection(
  collection: CompiledCollectionDto,
  utilities: ConverterUtilities,
): CategoryCollection {
  return utilities.createCategoryCollection({
    os: collection.os,
    scripting: convertToScriptingDefinition(collection, utilities),
    actions: collection.rootCategories.map((category) => convertToCategory(category, utilities)),
  });
}

function convertToCategory(
  category: CompiledCategoryDto,
  utilities: ConverterUtilities,
): Category {

}

function convertToScript(
  script: CompiledScriptDto,
  utilities: ConverterUtilities,
): Script {

}

function convertToScriptingDefinition(
  collection: CompiledCollectionDto,
  utilities: ConverterUtilities,
): ScriptingDefinition {
  return utilities.createScriptingDefinition({
    language: collection.language,
    startCode: collection.startCode,
    endCode: collection.endCode,
  });
}
