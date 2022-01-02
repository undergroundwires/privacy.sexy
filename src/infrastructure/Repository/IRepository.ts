import { IEntity } from '../Entity/IEntity';

export interface IRepository<TKey, TEntity extends IEntity<TKey>> {
  readonly length: number;
  getItems(predicate?: (entity: TEntity) => boolean): TEntity[];
  getById(id: TKey): TEntity | undefined;
  addItem(item: TEntity): void;
  addOrUpdateItem(item: TEntity): void;
  removeItem(id: TKey): void;
  exists(id: TKey): boolean;
}
