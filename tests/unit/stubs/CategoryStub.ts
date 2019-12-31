import { ScriptStub } from './ScriptStub';
import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { ICategory, IScript } from '@/domain/ICategory';

export class CategoryStub extends BaseEntity<number> implements ICategory  {
    public readonly name = `category-with-id-${this.id}`;
    public readonly subCategories = new Array<ICategory>();
    public readonly scripts = new Array<IScript>();
    public readonly documentationUrls = new Array<string>();

    constructor(id: number) {
        super(id);
    }
    public withScripts(...scriptIds: string[]): CategoryStub {
        for (const scriptId of scriptIds) {
            this.scripts.push(new ScriptStub(scriptId));
        }
        return this;
    }
}
