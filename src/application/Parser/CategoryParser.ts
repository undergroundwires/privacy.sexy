import type {
  CategoryData, ScriptData, CategoryOrScriptData,
} from '@/application/collections/';
import { Script } from '@/domain/Script';
import { Category } from '@/domain/Category';
import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Parser/ContextualError';
import type { ICategory } from '@/domain/ICategory';
import { parseDocs, type DocsParser } from './DocumentationParser';
import { parseScript, type ScriptParser } from './Script/ScriptParser';
import { createNodeDataValidator, type NodeDataValidator, type NodeDataValidatorFactory } from './NodeValidation/NodeDataValidator';
import { NodeDataType } from './NodeValidation/NodeDataType';
import type { ICategoryCollectionParseContext } from './Script/ICategoryCollectionParseContext';

let categoryIdCounter = 0;

export function parseCategory(
  category: CategoryData,
  context: ICategoryCollectionParseContext,
  utilities: CategoryParserUtilities = DefaultCategoryParserUtilities,
): Category {
  return parseCategoryRecursively({
    categoryData: category,
    context,
    utilities,
  });
}

interface CategoryParseContext {
  readonly categoryData: CategoryData;
  readonly context: ICategoryCollectionParseContext;
  readonly parentCategory?: CategoryData;
  readonly utilities: CategoryParserUtilities;
}

function parseCategoryRecursively(
  context: CategoryParseContext,
): Category | never {
  const validator = ensureValidCategory(context);
  const children: CategoryChildren = {
    subcategories: new Array<Category>(),
    subscripts: new Array<Script>(),
  };
  for (const data of context.categoryData.children) {
    parseNode({
      nodeData: data,
      children,
      parent: context.categoryData,
      utilities: context.utilities,
      context: context.context,
    });
  }
  try {
    return context.utilities.createCategory({
      id: categoryIdCounter++,
      name: context.categoryData.category,
      docs: context.utilities.parseDocs(context.categoryData),
      subcategories: children.subcategories,
      scripts: children.subscripts,
    });
  } catch (error) {
    throw context.utilities.wrapError(
      error,
      validator.createContextualErrorMessage('Failed to parse category.'),
    );
  }
}

function ensureValidCategory(
  context: CategoryParseContext,
): NodeDataValidator {
  const category = context.categoryData;
  const validator: NodeDataValidator = context.utilities.createValidator({
    type: NodeDataType.Category,
    selfNode: context.categoryData,
    parentNode: context.parentCategory,
  });
  validator.assertDefined(category);
  validator.assertValidName(category.category);
  validator.assert(
    () => Boolean(category.children) && category.children.length > 0,
    `"${category.category}" has no children.`,
  );
  return validator;
}

interface CategoryChildren {
  readonly subcategories: Category[];
  readonly subscripts: Script[];
}

interface NodeParseContext {
  readonly nodeData: CategoryOrScriptData;
  readonly children: CategoryChildren;
  readonly parent: CategoryData;
  readonly context: ICategoryCollectionParseContext;

  readonly utilities: CategoryParserUtilities;
}

function parseNode(context: NodeParseContext) {
  const validator: NodeDataValidator = context.utilities.createValidator({
    selfNode: context.nodeData,
    parentNode: context.parent,
  });
  validator.assertDefined(context.nodeData);
  validator.assert(
    () => isCategory(context.nodeData) || isScript(context.nodeData),
    'Node is neither a category or a script.',
  );
  if (isCategory(context.nodeData)) {
    const subCategory = parseCategoryRecursively({
      categoryData: context.nodeData,
      context: context.context,
      parentCategory: context.parent,
      utilities: context.utilities,
    });
    context.children.subcategories.push(subCategory);
  } else { // A script
    const script = context.utilities.parseScript(context.nodeData, context.context);
    context.children.subscripts.push(script);
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

function hasProperty(
  object: unknown,
  propertyName: string,
): object is NonNullable<object> {
  if (typeof object !== 'object') {
    return false;
  }
  if (object === null) { // `typeof object` is `null`
    return false;
  }
  return Object.prototype.hasOwnProperty.call(object, propertyName);
}

export type CategoryFactory = (
  ...parameters: ConstructorParameters<typeof Category>
) => ICategory;

interface CategoryParserUtilities {
  readonly createCategory: CategoryFactory;
  readonly wrapError: ErrorWithContextWrapper;
  readonly createValidator: NodeDataValidatorFactory;
  readonly parseScript: ScriptParser;
  readonly parseDocs: DocsParser;
}

const DefaultCategoryParserUtilities: CategoryParserUtilities = {
  createCategory: (...parameters) => new Category(...parameters),
  wrapError: wrapErrorWithAdditionalContext,
  createValidator: createNodeDataValidator,
  parseScript,
  parseDocs,
};
