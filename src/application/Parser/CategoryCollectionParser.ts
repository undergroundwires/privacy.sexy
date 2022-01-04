import type { CollectionData } from '@/application/collections/';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { OsCategoryCollectionKey } from '@/domain/Collection/Key/OsCategoryCollectionKey';
import { CachedCategoryCollection } from '@/domain/Collection/CachedCategoryCollection';
import { createEnumParser } from '../Common/Enum';
import { parseCategory } from './CategoryParser';
import { CategoryCollectionParseContextFacade } from './Script/CategoryCollectionParseContextFacade';
import { ScriptingDefinitionParser } from './ScriptingDefinition/ScriptingDefinitionParser';

// TODO: 1) Ensure all `new ..` is tested.

export function parseCategoryCollection(
  content: CollectionData,
  projectDetails: ProjectDetails,
  osParser = createEnumParser(OperatingSystem),
): CategoryCollection {
  validate(content);
  const scripting = new ScriptingDefinitionParser()
    .parse(content.scripting, projectDetails);
  const os = osParser.parseEnum(content.os, 'os');
  const collectionKey = new OsCategoryCollectionKey(os);
  const context = new CategoryCollectionParseContextFacade(
    collectionKey,
    content.functions,
    scripting,
  );
  const categories = content.actions.map((action) => parseCategory(action, context));
  const collection = new CachedCategoryCollection(
    collectionKey,
    categories,
    scripting,
  );
  return collection;
}

function validate(content: CollectionData): void {
  if (!content.actions.length) {
    throw new Error('content does not define any action');
  }
}
