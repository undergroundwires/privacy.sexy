import type {
  CategoryData, ScriptData, ExecutableData,
} from '@/application/collections/';
import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Application/Loader/Collections/Compiler/Common/ContextualError';
import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';
import { createCategory, type CategoryFactory } from '@/domain/Executables/Category/CategoryFactory';
import { parseDocs, type DocsParser } from '@/application/Application/Loader/Collections/Compiler/Executable/DocumentationParser';
import { parseScript, type ScriptParser } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/ScriptParser';
import { createExecutableDataValidator, type ExecutableValidator, type ExecutableValidatorFactory } from '@/application/Application/Loader/Collections/Compiler/Executable/Validation/ExecutableValidator';
import { ExecutableType } from '@/application/Application/Loader/Collections/Compiler/Executable/Validation/ExecutableType';
import type { CategoryCollectionContext } from '@/application/Application/Loader/Collections/Compiler/Executable/CategoryCollectionContext';

export const parseCategory: CategoryParser = (
  category: CategoryData,
  collectionContext: CategoryCollectionContext,
  categoryUtilities: CategoryParserUtilities = DefaultCategoryParserUtilities,
) => {
  return parseCategoryRecursively({
    categoryData: category,
    collectionContext,
    categoryUtilities,
  });
};

export interface CategoryParser {
  (
    category: CategoryData,
    collectionContext: CategoryCollectionContext,
    categoryUtilities?: CategoryParserUtilities,
  ): Category;
}

interface CategoryParseContext {
  readonly categoryData: CategoryData;
  readonly collectionContext: CategoryCollectionContext;
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
      collectionContext: context.collectionContext,
    });
  }
  try {
    return context.categoryUtilities.createCategory({
      executableId: context.categoryData.category, // Pseudo-ID for uniqueness until real ID support
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
    valueName: category.category ? `Category '${category.category}'` : 'Category',
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
  readonly collectionContext: CategoryCollectionContext;
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
      collectionContext: context.collectionContext,
      parentCategory: context.parent,
      categoryUtilities: context.categoryUtilities,
    });
    context.children.subcategories.push(subCategory);
  } else { // A script
    const script = context.categoryUtilities.parseScript(context.data, context.collectionContext);
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

interface CategoryParserUtilities {
  readonly createCategory: CategoryFactory;
  readonly wrapError: ErrorWithContextWrapper;
  readonly createValidator: ExecutableValidatorFactory;
  readonly parseScript: ScriptParser;
  readonly parseDocs: DocsParser;
}

const DefaultCategoryParserUtilities: CategoryParserUtilities = {
  createCategory,
  wrapError: wrapErrorWithAdditionalContext,
  createValidator: createExecutableDataValidator,
  parseScript,
  parseDocs,
};
