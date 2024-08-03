import type { RepositoryEntity } from './RepositoryEntity';

type EntityId = RepositoryEntity['id'];

export interface ReadonlyRepository<TEntity extends RepositoryEntity> {
  readonly length: number;
  getItems(predicate?: (entity: TEntity) => boolean): readonly TEntity[];
  getById(id: EntityId): TEntity;
  exists(id: EntityId): boolean;
}

export interface MutableRepository<TEntity extends RepositoryEntity> {
  addItem(item: TEntity): void;
  addOrUpdateItem(item: TEntity): void;
  removeItem(id: EntityId): void;
}

export interface Repository<TEntity extends RepositoryEntity>
  extends ReadonlyRepository<TEntity>, MutableRepository<TEntity> { }
