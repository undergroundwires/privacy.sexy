import { YamlCategory, YamlScript } from 'js-yaml-loader!./application.yaml';
import { Script } from '@/domain/Script';
import { Category } from '../../domain/Category';
import { parseDocUrls } from './DocumentationParser';

let categoryIdCounter: number = 0;


interface ICategoryChildren {
    subCategories: Category[];
    subScripts: Script[];
}

export function parseCategory(category: YamlCategory): Category {
    if (!category.children || category.children.length <= 0) {
        throw Error('Category has no children');
    }
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

function parseCategoryChild(
    categoryOrScript: any, children: ICategoryChildren, parent: YamlCategory) {
    if (isCategory(categoryOrScript)) {
        const subCategory = parseCategory(categoryOrScript as YamlCategory);
        children.subCategories.push(subCategory);
    } else if (isScript(categoryOrScript)) {
        const yamlScript = categoryOrScript as YamlScript;
        const script = new Script(
            /* name */  yamlScript.name,
            /* code */ yamlScript.code,
            /* docs */ parseDocUrls(yamlScript),
            /* is recommended? */ yamlScript.recommend);
        children.subScripts.push(script);
    } else {
        throw new Error(`Child element is neither a category or a script.
                Parent: ${parent.category}, element: ${categoryOrScript}`);
    }
}


function isScript(categoryOrScript: any): boolean {
    return categoryOrScript.code && categoryOrScript.code.length > 0;
}

function isCategory(categoryOrScript: any): boolean {
    return categoryOrScript.category && categoryOrScript.category.length > 0;
}
