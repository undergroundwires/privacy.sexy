<<<<<<< HEAD
import type { Repository } from '../../application/Repository/Repository';
import type { RepositoryEntity } from '../../application/Repository/RepositoryEntity';

export class InMemoryRepository<TEntity extends RepositoryEntity>
implements Repository<TEntity> {
=======
import type { Repository } from '@/application/Repository/Repository';
import type { Identifiable } from '@/domain/Identifiable/Identifiable';
import type { Key } from '@/domain/Identifiable/Key';

export class InMemoryRepository<TId extends Key, TEntity extends Identifiable<TId>>
implements Repository<TId, TEntity> {
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
  private readonly items: TEntity[];

  constructor(items?: readonly TEntity[]) {
    this.items = new Array<TEntity>();
    if (items) {
      this.items.push(...items);
    }
  }

  public get length(): number {
    return this.items.length;
  }

  public getItems(predicate?: (entity: TEntity) => boolean): TEntity[] {
    return predicate ? this.items.filter(predicate) : this.items;
  }

<<<<<<< HEAD
  public getById(id: string): TEntity {
    const items = this.getItems((entity) => entity.id === id);
=======
  public getById(id: TId): TEntity {
    const items = this.getItems((entity) => entity.key.equals(id));
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
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

<<<<<<< HEAD
  public removeItem(id: string): void {
    const index = this.items.findIndex((item) => item.id === id);
=======
  public removeItem(key: TId): void {
    const index = this.items.findIndex((item) => item.key.equals(key));
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
    if (index === -1) {
      throw new Error(`Cannot remove (id: ${key}) as it does not exist`);
    }
    this.items.splice(index, 1);
  }

<<<<<<< HEAD
  public exists(id: string): boolean {
    const index = this.items.findIndex((item) => item.id === id);
=======
  public exists(key: TId): boolean {
    const index = this.items.findIndex((item) => item.key.equals(key));
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
    return index !== -1;
  }
}
