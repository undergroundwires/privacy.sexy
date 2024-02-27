import { isNumber } from '@/TypeHelpers';
import type { IEntity } from './IEntity';

export abstract class BaseEntity<TId> implements IEntity<TId> {
  protected constructor(public id: TId) {
    if (!isNumber(id) && !id) {
      throw new Error('Id cannot be null or empty');
    }
  }

  public equals(otherId: TId): boolean {
    return this.id === otherId;
  }
}
