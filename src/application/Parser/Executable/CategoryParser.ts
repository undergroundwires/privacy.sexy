import type {
  CategoryData, ScriptData, ExecutableData,
} from '@/application/collections/';
import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import type { Category } from '@/domain/Executables/Category/Category';
import { CollectionCategory } from '@/domain/Executables/Category/CollectionCategory';
import type { Script } from '@/domain/Executables/Script/Script';
import { parseDocs, type DocsParser } from './DocumentationParser';
import { parseScript, type ScriptParser } from './Script/ScriptParser';
import { createExecutableDataValidator, type ExecutableValidator, type ExecutableValidatorFactory } from './Validation/ExecutableValidator';
import { ExecutableType } from './Validation/ExecutableType';
import type { CategoryCollectionSpecificUtilities } from './CategoryCollectionSpecificUtilities';

let categoryIdCounter = 0;

export const parseCategory: CategoryParser = (
  category: CategoryData,
  collectionUtilities: CategoryCollectionSpecificUtilities,
  categoryUtilities: CategoryParserUtilities = DefaultCategoryParserUtilities,
) => {
  return parseCategoryRecursively({
    categoryData: category,
    collectionUtilities,
    categoryUtilities,
  });
};

export interface CategoryParser {
  (
    category: CategoryData,
    collectionUtilities: CategoryCollectionSpecificUtilities,
    categoryUtilities?: CategoryParserUtilities,
  ): Category;
}

interface CategoryParseContext {
  readonly categoryData: CategoryData;
  readonly collectionUtilities: CategoryCollectionSpecificUtilities;
  readonly parentCategory?: CategoryData;
  readonly categoryUtilities: CategoryParserUtilities;
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
    parseUnknownExecutable({
      data,
      children,
      parent: context.categoryData,
      categoryUtilities: context.categoryUtilities,
      collectionUtilities: context.collectionUtilities,
    });
  }
  try {
    return context.categoryUtilities.createCategory({
      id: categoryIdCounter++,
      name: context.categoryData.category,
      docs: context.categoryUtilities.parseDocs(context.categoryData),
      subcategories: children.subcategories,
      scripts: children.subscripts,
    });
  } catch (error) {
    throw context.categoryUtilities.wrapError(
      error,
      validator.createContextualErrorMessage('Failed to parse category.'),
    );
  }
}

function ensureValidCategory(
  context: CategoryParseContext,
): ExecutableValidator {
  const category = context.categoryData;
  const validator: ExecutableValidator = context.categoryUtilities.createValidator({
    type: ExecutableType.Category,
    self: context.categoryData,
    parentCategory: context.parentCategory,
  });
  validator.assertType((v) => v.assertObject({
    value: category,
    valueName: category.category ?? 'category',
    allowedProperties: [
      'docs', 'children', 'category',
    ],
  }));
  validator.assertValidName(category.category);
  validator.assertType((v) => v.assertNonEmptyCollection({
    value: category.children,
    valueName: category.category,
  }));
  return validator;
}

interface CategoryChildren {
  readonly subcategories: Category[];
  readonly subscripts: Script[];
}

interface ExecutableParseContext {
  readonly data: ExecutableData;
  readonly children: CategoryChildren;
  readonly parent: CategoryData;
  readonly collectionUtilities: CategoryCollectionSpecificUtilities;
  readonly categoryUtilities: CategoryParserUtilities;
}

function parseUnknownExecutable(context: ExecutableParseContext) {
  const validator: ExecutableValidator = context.categoryUtilities.createValidator({
    self: context.data,
    parentCategory: context.parent,
  });
  validator.assertType((v) => v.assertObject({
    value: context.data,
    valueName: 'Executable',
  }));
  validator.assert(
    () => isCategory(context.data) || isScript(context.data),
    'Executable is neither a category or a script.',
  );
  if (isCategory(context.data)) {
    const subCategory = parseCategoryRecursively({
      categoryData: context.data,
      collectionUtilities: context.collectionUtilities,
      parentCategory: context.parent,
      categoryUtilities: context.categoryUtilities,
    });
    context.children.subcategories.push(subCategory);
  } else { // A script
    const script = context.categoryUtilities.parseScript(context.data, context.collectionUtilities);
    context.children.subscripts.push(script);
  }
}

function isScript(data: ExecutableData): data is ScriptData {
  return hasCode(data) || hasCall(data);
}

function isCategory(data: ExecutableData): data is CategoryData {
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
  ...parameters: ConstructorParameters<typeof CollectionCategory>
) => Category;

interface CategoryParserUtilities {
  readonly createCategory: CategoryFactory;
  readonly wrapError: ErrorWithContextWrapper;
  readonly createValidator: ExecutableValidatorFactory;
  readonly parseScript: ScriptParser;
  readonly parseDocs: DocsParser;
}

const DefaultCategoryParserUtilities: CategoryParserUtilities = {
  createCategory: (...parameters) => new CollectionCategory(...parameters),
  wrapError: wrapErrorWithAdditionalContext,
  createValidator: createExecutableDataValidator,
  parseScript,
  parseDocs,
};
