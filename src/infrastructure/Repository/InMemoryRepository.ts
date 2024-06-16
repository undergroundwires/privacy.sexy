import type { Repository } from '@/application/Repository/Repository';
import type { Identifiable } from '@/domain/Identifiable/Identifiable';
import type { Key } from '@/domain/Identifiable/Key';

export class InMemoryRepository<TId extends Key, TEntity extends Identifiable<TId>>
implements Repository<TId, TEntity> {
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

  public getById(id: TId): TEntity {
    const items = this.getItems((entity) => entity.key.equals(id));
    if (!items.length) {
      throw new Error(`missing item: ${id}`);
    }
    return items[0];
  }

  public addItem(item: TEntity): void {
    if (this.exists(item.key)) {
      throw new Error(`Cannot add (id: ${item.key.createSerializedKey()}) as it is already exists`);
    }
    this.items.push(item);
  }

  public addOrUpdateItem(item: TEntity): void {
    if (this.exists(item.key)) {
      this.removeItem(item.key);
    }
    this.items.push(item);
  }

  public removeItem(key: TId): void {
    const index = this.items.findIndex((item) => item.key.equals(key));
    if (index === -1) {
      throw new Error(`Cannot remove (id: ${key}) as it does not exist`);
    }
    this.items.splice(index, 1);
  }

  public exists(key: TId): boolean {
    const index = this.items.findIndex((item) => item.key.equals(key));
    return index !== -1;
  }
}
