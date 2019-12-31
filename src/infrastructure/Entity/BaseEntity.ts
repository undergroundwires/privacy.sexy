import { IEntity } from './IEntity';

export abstract class BaseEntity<TId> implements IEntity<TId> {
    constructor(public id: TId) {
        if (typeof id !== 'number' && !id) {
            throw new Error('Id cannot be null or empty');
        }
    }
    public equals(otherId: TId): boolean {
        return this.id === otherId;
    }
}


