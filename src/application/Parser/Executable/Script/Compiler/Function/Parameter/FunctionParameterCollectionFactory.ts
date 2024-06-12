import { FunctionParameterCollection } from './FunctionParameterCollection';
import type { IFunctionParameterCollection } from './IFunctionParameterCollection';

export interface FunctionParameterCollectionFactory {
  (
    ...args: ConstructorParameters<typeof FunctionParameterCollection>
  ): IFunctionParameterCollection;
}

export const createFunctionParameterCollection: FunctionParameterCollectionFactory = (...args) => {
  return new FunctionParameterCollection(...args);
};
