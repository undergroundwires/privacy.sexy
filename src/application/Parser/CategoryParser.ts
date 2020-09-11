import { YamlCategory, YamlScript } from 'js-yaml-loader!./application.yaml';
import { Script } from '@/domain/Script';
import { Category } from '@/domain/Category';
import { parseDocUrls } from './DocumentationParser';
import { parseScript } from './ScriptParser';

let categoryIdCounter: number = 0;

interface ICategoryChildren {
    subCategories: Category[];
    subScripts: Script[];
}

export function parseCategory(category: YamlCategory): Category {
    ensureValid(category);
    const children: ICategoryChildren = {
        subCategories: new Array<Category>(),
        subScripts: new Array<Script>(),
    };
    for (const categoryOrScript of category.children) {
        parseCategoryChild(categoryOrScript, children, category);
    }
    return new Category(
        /*id*/ categoryIdCounter++,
        /*name*/ category.category,
        /*docs*/ parseDocUrls(category),
        /*categories*/ children.subCategories,
        /*scripts*/ children.subScripts,
    );
}

function ensureValid(category: YamlCategory) {
    if (!category) {
        throw Error('category is null or undefined');
    }
    if (!category.children || category.children.length === 0) {
        throw Error('category has no children');
    }
    if (!category.category || category.category.length === 0) {
        throw Error('category has no name');
    }
}

function parseCategoryChild(
    categoryOrScript: any, children: ICategoryChildren, parent: YamlCategory) {
    if (isCategory(categoryOrScript)) {
        const subCategory = parseCategory(categoryOrScript as YamlCategory);
        children.subCategories.push(subCategory);
    } else if (isScript(categoryOrScript)) {
        const yamlScript = categoryOrScript as YamlScript;
        const script = parseScript(yamlScript);
        children.subScripts.push(script);
    } else {
        throw new Error(`Child element is neither a category or a script.
                Parent: ${parent.category}, element: ${JSON.stringify(categoryOrScript)}`);
    }
}

function isScript(categoryOrScript: any): boolean {
    return categoryOrScript.code && categoryOrScript.code.length > 0;
}

function isCategory(categoryOrScript: any): boolean {
    return categoryOrScript.category && categoryOrScript.category.length > 0;
}
