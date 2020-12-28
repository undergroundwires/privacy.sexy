import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { IScript } from '@/domain/IScript';

export class SelectedScript extends BaseEntity<string> {
    constructor(
        public readonly script: IScript,
        public readonly revert: boolean,
        ) {
        super(script.id);
        if (revert && !script.canRevert()) {
            throw new Error('cannot revert an irreversible script');
        }
    }
}
