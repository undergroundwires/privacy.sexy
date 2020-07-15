import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';

export class NumericEntityStub extends BaseEntity<number> {
    public customProperty = 'customProperty';
    constructor(id: number) {
        super(id);
    }
    public withCustomProperty(value: string): NumericEntityStub {
        this.customProperty = value;
        return this;
    }
}
