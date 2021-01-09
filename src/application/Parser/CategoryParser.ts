import { CategoryData, ScriptData, CategoryOrScriptData } from 'js-yaml-loader!@/*';
import { Script } from '@/domain/Script';
import { Category } from '@/domain/Category';
import { parseDocUrls } from './DocumentationParser';
import { parseScript } from './ScriptParser';
import { IScriptCompiler } from './Compiler/IScriptCompiler';

let categoryIdCounter: number = 0;

interface ICategoryChildren {
    subCategories: Category[];
    subScripts: Script[];
}

export function parseCategory(category: CategoryData, compiler: IScriptCompiler): Category {
    if (!compiler) {
        throw new Error('undefined compiler');
    }
    ensureValid(category);
    const children: ICategoryChildren = {
        subCategories: new Array<Category>(),
        subScripts: new Array<Script>(),
    };
    for (const data of category.children) {
        parseCategoryChild(data, children, category, compiler);
    }
    return new Category(
        /*id*/ categoryIdCounter++,
        /*name*/ category.category,
        /*docs*/ parseDocUrls(category),
        /*categories*/ children.subCategories,
        /*scripts*/ children.subScripts,
    );
}

function ensureValid(category: CategoryData) {
    if (!category) {
        throw Error('category is null or undefined');
    }
    if (!category.children || category.children.length === 0) {
        throw Error(`category has no children: "${category.category}"`);
    }
    if (!category.category || category.category.length === 0) {
        throw Error('category has no name');
    }
}

function parseCategoryChild(
    data: CategoryOrScriptData,
    children: ICategoryChildren,
    parent: CategoryData,
    compiler: IScriptCompiler) {
    if (isCategory(data)) {
        const subCategory = parseCategory(data as CategoryData, compiler);
        children.subCategories.push(subCategory);
    } else if (isScript(data)) {
        const scriptData = data as ScriptData;
        const script = parseScript(scriptData, compiler);
        children.subScripts.push(script);
    } else {
        throw new Error(`Child element is neither a category or a script.
                Parent: ${parent.category}, element: ${JSON.stringify(data)}`);
    }
}

function isScript(data: any): boolean {
    return (data.code && data.code.length > 0)
        || data.call;
}

function isCategory(data: any): boolean {
    return data.category && data.category.length > 0;
}
