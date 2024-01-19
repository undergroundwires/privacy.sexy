import type {
  CategoryData, ScriptData, CategoryOrScriptData,
} from '@/application/collections/';
import { Script } from '@/domain/Script';
import { Category } from '@/domain/Category';
import { NodeValidator } from '@/application/Parser/NodeValidation/NodeValidator';
import { NodeType } from '@/application/Parser/NodeValidation/NodeType';
import { parseDocs } from './DocumentationParser';
import { ICategoryCollectionParseContext } from './Script/ICategoryCollectionParseContext';
import { parseScript } from './Script/ScriptParser';

let categoryIdCounter = 0;

export function parseCategory(
  category: CategoryData,
  context: ICategoryCollectionParseContext,
  factory: CategoryFactoryType = CategoryFactory,
): Category {
  return parseCategoryRecursively({
    categoryData: category,
    context,
    factory,
  });
}

interface ICategoryParseContext {
  readonly categoryData: CategoryData,
  readonly context: ICategoryCollectionParseContext,
  readonly factory: CategoryFactoryType,
  readonly parentCategory?: CategoryData,
}

function parseCategoryRecursively(context: ICategoryParseContext): Category | never {
  ensureValidCategory(context.categoryData, context.parentCategory);
  const children: ICategoryChildren = {
    subCategories: new Array<Category>(),
    subScripts: new Array<Script>(),
  };
  for (const data of context.categoryData.children) {
    parseNode({
      nodeData: data,
      children,
      parent: context.categoryData,
      factory: context.factory,
      context: context.context,
    });
  }
  try {
    return context.factory(
      /* id: */ categoryIdCounter++,
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
    .assertValidName(category.category)
    .assert(
      () => category.children.length > 0,
      `"${category.category}" has no children.`,
    );
}

interface ICategoryChildren {
  subCategories: Category[];
  subScripts: Script[];
}

interface INodeParseContext {
  readonly nodeData: CategoryOrScriptData;
  readonly children: ICategoryChildren;
  readonly parent: CategoryData;
  readonly factory: CategoryFactoryType;
  readonly context: ICategoryCollectionParseContext;
}
function parseNode(context: INodeParseContext) {
  const validator = new NodeValidator({ selfNode: context.nodeData, parentNode: context.parent });
  validator.assertDefined(context.nodeData);
  if (isCategory(context.nodeData)) {
    const subCategory = parseCategoryRecursively({
      categoryData: context.nodeData,
      context: context.context,
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
  ...parameters: ConstructorParameters<typeof Category>) => Category;

const CategoryFactory: CategoryFactoryType = (...parameters) => new Category(...parameters);
