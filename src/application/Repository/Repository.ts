import { IEntity } from '@/infrastructure/Entity/IEntity';

export interface ReadonlyRepository<TKey, TEntity extends IEntity<TKey>> {
  readonly length: number;
  getItems(predicate?: (entity: TEntity) => boolean): readonly TEntity[];
  getById(id: TKey): TEntity;
  exists(id: TKey): boolean;
}

export interface MutableRepository<TKey, TEntity extends IEntity<TKey>> {
  addItem(item: TEntity): void;
  addOrUpdateItem(item: TEntity): void;
  removeItem(id: TKey): void;
}

export interface Repository<TKey, TEntity extends IEntity<TKey>>
  extends ReadonlyRepository<TKey, TEntity>, MutableRepository<TKey, TEntity> { }
