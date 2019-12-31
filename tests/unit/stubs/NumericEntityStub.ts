import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';

export class NumericEntityStub extends BaseEntity<number> {
    constructor(id: number) {
        super(id);
    }
}
