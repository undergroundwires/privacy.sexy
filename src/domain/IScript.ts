import { IEntity } from '../infrastructure/Entity/IEntity';
import { IDocumentable } from './IDocumentable';
import { RecommendationLevel } from './RecommendationLevel';

export interface IScript extends IEntity<string>, IDocumentable {
    readonly name: string;
    readonly level?: RecommendationLevel;
    readonly documentationUrls: ReadonlyArray<string>;
    readonly code: string;
    readonly revertCode: string;
    canRevert(): boolean;
}
