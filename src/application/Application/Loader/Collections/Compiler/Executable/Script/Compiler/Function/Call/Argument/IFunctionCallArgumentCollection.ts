import type { FunctionCallArgument } from './FunctionCallArgument';

export interface IReadOnlyFunctionCallArgumentCollection {
  getArgument(parameterName: string): FunctionCallArgument;
  getAllParameterNames(): string[];
  hasArgument(parameterName: string): boolean;
}

export interface IFunctionCallArgumentCollection extends IReadOnlyFunctionCallArgumentCollection {
  addArgument(argument: FunctionCallArgument): void;
}
