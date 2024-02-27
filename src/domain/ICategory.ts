import type { IEntity } from '../infrastructure/Entity/IEntity';
import type { IScript } from './IScript';
import type { IDocumentable } from './IDocumentable';

export interface ICategory extends IEntity<number>, IDocumentable {
  readonly id: number;
  readonly name: string;
  readonly subCategories: ReadonlyArray<ICategory>;
  readonly scripts: ReadonlyArray<IScript>;
  includes(script: IScript): boolean;
  getAllScriptsRecursively(): ReadonlyArray<IScript>;
}

export type { IEntity } from '../infrastructure/Entity/IEntity';
export type { IScript } from './IScript';
