import { BaseEntity } from '../infrastructure/Entity/BaseEntity';
import { IScript } from './IScript';
import { ICategory } from './ICategory';

export class Category extends BaseEntity<number> implements ICategory {
    private static validate(category: ICategory) {
        if (!category.name) {
            throw new Error('name is null or empty');
        }
        if ((!category.subCategories || category.subCategories.length === 0)
                && (!category.scripts || category.scripts.length === 0)) {
            throw new Error('A category must have at least one sub-category or scripts');
        }
    }

    constructor(
        id: number,
        public readonly name: string,
        public readonly documentationUrls: ReadonlyArray<string>,
        public readonly subCategories?: ReadonlyArray<ICategory>,
        public readonly scripts?: ReadonlyArray<IScript>) {
        super(id);
        Category.validate(this);
    }
}
