import { YamlCategory, YamlScript } from 'js-yaml-loader!./application.yaml';
import { Script } from '@/domain/Script';
import { Category } from '../../domain/Category';
import { parseDocUrls } from './DocumentationParser';

let categoryIdCounter: number = 0;

interface IParsingContext {
    category: YamlCategory;
    selectedScripts: Script[];
}

interface ICategoryChildren {
    subCategories: Category[];
    subScripts: Script[];
}

export function parseCategory(context: IParsingContext): Category {
    if (!context.category.children || context.category.children.length <= 0) {
        throw Error('Category has no children');
    }
    const children: ICategoryChildren = {
        subCategories: new Array<Category>(),
        subScripts: new Array<Script>(),
    };
    for (const categoryOrScript of context.category.children) {
        parseCategoryChild(categoryOrScript, children, context);
    }
    return new Category(
        /*id*/ categoryIdCounter++,
        /*name*/ context.category.category,
        /*docs*/ parseDocUrls(context.category),
        /*categories*/ children.subCategories,
        /*scripts*/ children.subScripts,
    );
}

function parseCategoryChild(
    categoryOrScript: any, children: ICategoryChildren, parent: IParsingContext) {
    if (isCategory(categoryOrScript)) {
        const subCategory = parseCategory(
            {
                category: categoryOrScript as YamlCategory,
                selectedScripts: parent.selectedScripts,
            });
        children.subCategories.push(subCategory);
    } else if (isScript(categoryOrScript)) {
        const yamlScript = categoryOrScript as YamlScript;
        const script = new Script(
            /* name */  yamlScript.name,
            /* code */ yamlScript.code,
            /* docs */ parseDocUrls(yamlScript));
        children.subScripts.push(script);
        if (yamlScript.default === true) {
            parent.selectedScripts.push(script);
        }
    } else {
        throw new Error(`Child element is neither a category or a script.
                Parent: ${parent.category.category}, element: ${categoryOrScript}`);
    }
}


function isScript(categoryOrScript: any): boolean {
    return categoryOrScript.code && categoryOrScript.code.length > 0;
}

function isCategory(categoryOrScript: any): boolean {
    return categoryOrScript.category && categoryOrScript.category.length > 0;
}
