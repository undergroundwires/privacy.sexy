import { IApplication, ICategory, IScript } from '@/domain/IApplication';

export class ApplicationStub implements IApplication {
    public readonly categories = new Array<ICategory>();

    public withCategory(category: ICategory): IApplication {
        this.categories.push(category);
        return this;
    }
    public findCategory(categoryId: number): ICategory {
        throw new Error('Method not implemented.');
    }

    public findScript(scriptId: string): IScript {
        throw new Error('Method not implemented.');
    }

    public getAllScripts(): ReadonlyArray<IScript> {
        throw new Error('Method not implemented.');
    }
}
