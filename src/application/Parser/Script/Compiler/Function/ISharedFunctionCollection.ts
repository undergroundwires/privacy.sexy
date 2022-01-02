import { ISharedFunction } from './ISharedFunction';

export interface ISharedFunctionCollection {
  getFunctionByName(name: string): ISharedFunction;
}
