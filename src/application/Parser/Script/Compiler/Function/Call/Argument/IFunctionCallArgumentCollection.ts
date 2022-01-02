import { IFunctionCallArgument } from './IFunctionCallArgument';

export interface IReadOnlyFunctionCallArgumentCollection {
  getArgument(parameterName: string): IFunctionCallArgument;
  getAllParameterNames(): string[];
  hasArgument(parameterName: string): boolean;
}

export interface IFunctionCallArgumentCollection extends IReadOnlyFunctionCallArgumentCollection {
  addArgument(argument: IFunctionCallArgument): void;
}
