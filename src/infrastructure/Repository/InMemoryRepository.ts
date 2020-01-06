import { IEntity } from '../Entity/IEntity';
import { IRepository } from './IRepository';

export class InMemoryRepository<TKey, TEntity extends IEntity<TKey>> implements IRepository<TKey, TEntity> {
    private readonly items: TEntity[];

    constructor(items?: TEntity[]) {
        this.items = items || new Array<TEntity>();
    }

    public get length(): number {
        return this.items.length;
    }

    public getItems(predicate?: (entity: TEntity) => boolean): TEntity[] {
        return predicate ? this.items.filter(predicate) : this.items;
    }

    public addItem(item: TEntity): void {
        if (!item) {
            throw new Error('Item is null');
        }
        if (this.exists(item)) {
            throw new Error(`Cannot add (id: ${item.id}) as it is already exists`);
        }
        this.items.push(item);
    }

    public removeItem(id: TKey): void {
        const index = this.items.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new Error(`Cannot remove (id: ${id}) as it does not exist`);
        }
        this.items.splice(index, 1);
    }

    public exists(entity: TEntity): boolean {
        const index = this.items.findIndex((item) => item.id === entity.id);
        return index !== -1;
    }
}
