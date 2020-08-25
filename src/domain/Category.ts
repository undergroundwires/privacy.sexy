import { BaseEntity } from '../infrastructure/Entity/BaseEntity';
import { IScript } from './IScript';
import { ICategory } from './ICategory';

export class Category extends BaseEntity<number> implements ICategory {
    private allSubScripts: ReadonlyArray<IScript> = undefined;

    constructor(
        id: number,
        public readonly name: string,
        public readonly documentationUrls: ReadonlyArray<string>,
        public readonly subCategories?: ReadonlyArray<ICategory>,
        public readonly scripts?: ReadonlyArray<IScript>) {
        super(id);
        validateCategory(this);
    }

    public getAllScriptsRecursively(): readonly IScript[] {
        return this.allSubScripts || (this.allSubScripts = parseScriptsRecursively(this));
    }
}

function parseScriptsRecursively(category: ICategory): ReadonlyArray<IScript> {
    return [
        ...category.scripts,
        ...category.subCategories.flatMap((c) => c.getAllScriptsRecursively()),
    ];
}

function validateCategory(category: ICategory) {
    if (!category.name) {
        throw new Error('undefined or empty name');
    }
    if ((!category.subCategories || category.subCategories.length === 0) &&
        (!category.scripts || category.scripts.length === 0)) {
        throw new Error('A category must have at least one sub-category or script');
    }
}
