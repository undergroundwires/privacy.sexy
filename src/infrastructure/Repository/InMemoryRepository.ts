import type { Repository } from '../../application/Repository/Repository';
import type { IEntity } from '../Entity/IEntity';

export class InMemoryRepository<TKey, TEntity extends IEntity<TKey>>
implements Repository<TKey, TEntity> {
  private readonly items: TEntity[];

  constructor(items?: TEntity[]) {
    this.items = items ?? new Array<TEntity>();
  }

  public get length(): number {
    return this.items.length;
  }

  public getItems(predicate?: (entity: TEntity) => boolean): TEntity[] {
    return predicate ? this.items.filter(predicate) : this.items;
  }

  public getById(id: TKey): TEntity {
    const items = this.getItems((entity) => entity.id === id);
    if (!items.length) {
      throw new Error(`missing item: ${id}`);
    }
    return items[0];
  }

  public addItem(item: TEntity): void {
    if (this.exists(item.id)) {
      throw new Error(`Cannot add (id: ${item.id}) as it is already exists`);
    }
    this.items.push(item);
  }

  public addOrUpdateItem(item: TEntity): void {
    if (this.exists(item.id)) {
      this.removeItem(item.id);
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

  public exists(id: TKey): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    return index !== -1;
  }
}
