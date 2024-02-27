import type { ISharedFunction } from './ISharedFunction';

export interface ISharedFunctionCollection {
  getFunctionByName(name: string): ISharedFunction;
  getRequiredParameterNames(functionName: string): string[];
}
