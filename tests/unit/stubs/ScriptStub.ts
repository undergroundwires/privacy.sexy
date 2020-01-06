import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { IScript } from './../../../src/domain/IScript';

export class ScriptStub extends BaseEntity<string> implements IScript {
    public readonly name = `name${this.id}`;
    public readonly code = `name${this.id}`;
    public readonly documentationUrls = new Array<string>();
    public isRecommended = false;

    constructor(public readonly id: string) {
        super(id);
    }

    public withIsRecommended(value: boolean): ScriptStub {
        this.isRecommended = value;
        return this;
    }
}
