import { IEntity } from '../infrastructure/Entity/IEntity';
import { IScript } from './IScript';
import { IDocumentable } from './IDocumentable';

export interface ICategory extends IEntity<number>, IDocumentable {
  readonly id: number;
  readonly name: string;
  readonly subCategories: ReadonlyArray<ICategory>;
  readonly scripts: ReadonlyArray<IScript>;
  includes(script: IScript): boolean;
  getAllScriptsRecursively(): ReadonlyArray<IScript>;
}

export { IEntity } from '../infrastructure/Entity/IEntity';
export { IScript } from './IScript';
