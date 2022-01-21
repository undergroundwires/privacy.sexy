import {
  CategoryData, ScriptData, CategoryOrScriptData, InstructionHolder,
} from 'js-yaml-loader!@/*';
import { Script } from '@/domain/Script';
import { Category } from '@/domain/Category';
import { parseDocUrls } from './DocumentationParser';
import { ICategoryCollectionParseContext } from './Script/ICategoryCollectionParseContext';
import { parseScript } from './Script/ScriptParser';

let categoryIdCounter = 0;

export function parseCategory(
  category: CategoryData,
  context: ICategoryCollectionParseContext,
): Category {
  if (!context) { throw new Error('undefined context'); }
  ensureValid(category);
  const children: ICategoryChildren = {
    subCategories: new Array<Category>(),
    subScripts: new Array<Script>(),
  };
  for (const data of category.children) {
    parseCategoryChild(data, children, category, context);
  }
  return new Category(
    /* id: */ categoryIdCounter++,
    /* name: */ category.category,
    /* docs: */ parseDocUrls(category),
    /* categories: */ children.subCategories,
    /* scripts: */ children.subScripts,
  );
}

function ensureValid(category: CategoryData) {
  if (!category) {
    throw Error('missing category');
  }
  if (!category.children || category.children.length === 0) {
    throw Error(`category has no children: "${category.category}"`);
  }
  if (!category.category || category.category.length === 0) {
    throw Error('category has no name');
  }
}

interface ICategoryChildren {
  subCategories: Category[];
  subScripts: Script[];
}

function parseCategoryChild(
  data: CategoryOrScriptData,
  children: ICategoryChildren,
  parent: CategoryData,
  context: ICategoryCollectionParseContext,
) {
  if (isCategory(data)) {
    const subCategory = parseCategory(data as CategoryData, context);
    children.subCategories.push(subCategory);
  } else if (isScript(data)) {
    const scriptData = data as ScriptData;
    const script = parseScript(scriptData, context);
    children.subScripts.push(script);
  } else {
    throw new Error(`Child element is neither a category or a script.
                Parent: ${parent.category}, element: ${JSON.stringify(data)}`);
  }
}

function isScript(data: CategoryOrScriptData): data is ScriptData {
  const holder = (data as InstructionHolder);
  return hasCode(holder) || hasCall(holder);
}

function isCategory(data: CategoryOrScriptData): data is CategoryData {
  const { category } = data as CategoryData;
  return category && category.length > 0;
}

function hasCode(holder: InstructionHolder): boolean {
  return holder.code && holder.code.length > 0;
}

function hasCall(holder: InstructionHolder) {
  return holder.call !== undefined;
}
