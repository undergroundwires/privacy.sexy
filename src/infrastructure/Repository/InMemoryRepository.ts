import type { Repository } from '../../application/Repository/Repository';
import type { RepositoryEntity, RepositoryEntityId } from '../../application/Repository/RepositoryEntity';

export class InMemoryRepository<TEntity extends RepositoryEntity>
implements Repository<TEntity> {
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

  public getById(id: RepositoryEntityId): TEntity {
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

  public removeItem(id: RepositoryEntityId): void {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Cannot remove (id: ${id}) as it does not exist`);
    }
    this.items.splice(index, 1);
  }

  public exists(id: RepositoryEntityId): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    return index !== -1;
  }
}
