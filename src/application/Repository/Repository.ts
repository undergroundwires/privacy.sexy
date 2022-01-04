import type { Identifiable } from '@/domain/Identifiable/Identifiable';
import type { Key } from '@/domain/Identifiable/Key';

export interface ReadonlyRepository<TKey extends Key, TEntity extends Identifiable<TKey>> {
  readonly length: number;
  getItems(predicate?: (entity: TEntity) => boolean): readonly TEntity[];
  getById(key: TKey): TEntity;
  exists(key: TKey): boolean;
}

export interface MutableRepository<TKey extends Key, TEntity extends Identifiable<TKey>> {
  addItem(item: TEntity): void;
  addOrUpdateItem(item: TEntity): void;
  removeItem(key: TKey): void;
}

export interface Repository<TKey extends Key, TEntity extends Identifiable<TKey>>
  extends ReadonlyRepository<TKey, TEntity>, MutableRepository<TKey, TEntity> { }
