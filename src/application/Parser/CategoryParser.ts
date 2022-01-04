import type {
  CategoryData, ScriptData, CategoryOrScriptData,
} from '@/application/collections/';
import { CollectionScript } from '@/domain/Executables/Script/CollectionScript';
import { CollectionCategory } from '@/domain/Executables/Category/CollectionCategory';
import { NodeValidator } from '@/application/Parser/NodeValidation/NodeValidator';
import { NodeType } from '@/application/Parser/NodeValidation/NodeType';
import { parseDocs } from './DocumentationParser';
import { parseScript } from './Script/ScriptParser';
import type { CategoryCollectionParseContext } from './Script/CategoryCollectionParseContext';

export function parseCategory(
  category: CategoryData,
  context: CategoryCollectionParseContext,
  factory: CategoryFactoryType = CategoryFactory,
): CollectionCategory {
  return parseCategoryRecursively({
    categoryData: category,
    collectionContext: context,
    factory,
  });
}

interface CategoryParseContext {
  readonly categoryData: CategoryData,
  readonly collectionContext: CategoryCollectionParseContext,
  readonly factory: CategoryFactoryType,
  readonly parentCategory?: CategoryData,
}

function parseCategoryRecursively(context: CategoryParseContext): CollectionCategory | never {
  ensureValidCategory(context.categoryData, context.parentCategory);
  const children: CategoryChildren = {
    subCategories: new Array<CollectionCategory>(),
    subScripts: new Array<CollectionScript>(),
  };
  for (const data of context.categoryData.children) {
    parseNode({
      nodeData: data,
      children,
      parent: context.categoryData,
      factory: context.factory,
      context: context.collectionContext,
    });
  }
  try {
    return context.factory(
      /* id: */ context.collectionContext.keyFactory.createExecutableKey(context.categoryData.id),
      /* name: */ context.categoryData.category,
      /* docs: */ parseDocs(context.categoryData),
      /* categories: */ children.subCategories,
      /* scripts: */ children.subScripts,
    );
  } catch (err) {
    return new NodeValidator({
      type: NodeType.Category,
      selfNode: context.categoryData,
      parentNode: context.parentCategory,
    }).throw(err.message);
  }
}

function ensureValidCategory(category: CategoryData, parentCategory?: CategoryData) {
  new NodeValidator({
    type: NodeType.Category,
    selfNode: category,
    parentNode: parentCategory,
  })
    .assertDefined(category)
    .assertExecutableId(category.id) // TODO: Unit test this
    .assertValidName(category.category)
    .assert(
      () => category.children.length > 0,
      `"${category.category}" has no children.`,
    );
}

interface CategoryChildren {
  readonly subCategories: CollectionCategory[];
  readonly subScripts: CollectionScript[];
}

interface NodeParseContext {
  readonly nodeData: CategoryOrScriptData;
  readonly children: CategoryChildren;
  readonly parent: CategoryData;
  readonly factory: CategoryFactoryType;
  readonly context: CategoryCollectionParseContext;
}
function parseNode(context: NodeParseContext) {
  const validator = new NodeValidator({ selfNode: context.nodeData, parentNode: context.parent });
  validator.assertDefined(context.nodeData);
  if (isCategory(context.nodeData)) {
    const subCategory = parseCategoryRecursively({
      categoryData: context.nodeData,
      collectionContext: context.context,
      factory: context.factory,
      parentCategory: context.parent,
    });
    context.children.subCategories.push(subCategory);
  } else if (isScript(context.nodeData)) {
    const script = parseScript(context.nodeData, context.context);
    context.children.subScripts.push(script);
  } else {
    validator.throw('Node is neither a category or a script.');
  }
}

function isScript(data: CategoryOrScriptData): data is ScriptData {
  return hasCode(data) || hasCall(data);
}

function isCategory(data: CategoryOrScriptData): data is CategoryData {
  return hasProperty(data, 'category');
}

function hasCode(data: unknown): boolean {
  return hasProperty(data, 'code');
}

function hasCall(data: unknown) {
  return hasProperty(data, 'call');
}

function hasProperty(object: unknown, propertyName: string) {
  return Object.prototype.hasOwnProperty.call(object, propertyName);
}

export type CategoryFactoryType = (
  ...parameters: ConstructorParameters<typeof CollectionCategory>) => CollectionCategory;

const CategoryFactory: CategoryFactoryType = (
  ...parameters
) => new CollectionCategory(...parameters);
