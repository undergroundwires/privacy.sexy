import type { FunctionParameter } from './FunctionParameter';

export interface IReadOnlyFunctionParameterCollection {
  readonly all: readonly FunctionParameter[];
}

export interface IFunctionParameterCollection extends IReadOnlyFunctionParameterCollection {
  addParameter(parameter: FunctionParameter): void;
}
