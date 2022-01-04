import { CollectionData } from 'js-yaml-loader!@/*';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { CategoryCollection } from '@/domain/CategoryCollection';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { createEnumParser } from '../Common/Enum';
import { parseCategory } from './CategoryParser';
import { CategoryCollectionParseContext } from './Script/CategoryCollectionParseContext';
import { ScriptingDefinitionParser } from './ScriptingDefinition/ScriptingDefinitionParser';

export function parseCategoryCollection(
  content: CollectionData,
  info: IProjectInformation,
  osParser = createEnumParser(OperatingSystem),
): ICategoryCollection {
  validate(content);
  const scripting = new ScriptingDefinitionParser()
    .parse(content.scripting, info);
  const context = new CategoryCollectionParseContext(content.functions, scripting);
  const categories = content.actions.map((action) => parseCategory(action, context));
  const os = osParser.parseEnum(content.os, 'os');
  const collection = new CategoryCollection(
    os,
    categories,
    scripting,
  );
  return collection;
}

function validate(content: CollectionData): void {
  if (!content) {
    throw new Error('content is null or undefined');
  }
  if (!content.actions || content.actions.length <= 0) {
    throw new Error('content does not define any action');
  }
}
