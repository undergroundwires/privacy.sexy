import { IEntity } from '../infrastructure/Entity/IEntity';
import { IDocumentable } from './IDocumentable';

export interface IScript extends IEntity<string>, IDocumentable {
    readonly name: string;
    readonly isRecommended: boolean;
    readonly documentationUrls: ReadonlyArray<string>;
    readonly code: string;
    readonly revertCode: string;
    canRevert(): boolean;
}
