import type { CollectionData } from '@/application/collections/';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { ICategoryCollection } from '@/domain/ICategoryCollection';
import { CategoryCollection } from '@/domain/CategoryCollection';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { createEnumParser } from '../Common/Enum';
import { parseCategory } from './Executable/CategoryParser';
import { ScriptingDefinitionParser } from './ScriptingDefinition/ScriptingDefinitionParser';
import { createCollectionUtilities, type CategoryCollectionSpecificUtilitiesFactory } from './Executable/CategoryCollectionSpecificUtilities';

export function parseCategoryCollection(
  content: CollectionData,
  projectDetails: ProjectDetails,
  osParser = createEnumParser(OperatingSystem),
  createUtilities: CategoryCollectionSpecificUtilitiesFactory = createCollectionUtilities,
): ICategoryCollection {
  validate(content);
  const scripting = new ScriptingDefinitionParser()
    .parse(content.scripting, projectDetails);
  const utilities = createUtilities(content.functions, scripting);
  const categories = content.actions.map((action) => parseCategory(action, utilities));
  const os = osParser.parseEnum(content.os, 'os');
  const collection = new CategoryCollection(
    os,
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
