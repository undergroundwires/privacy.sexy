import { IFunctionParameter } from './IFunctionParameter';

export interface IReadOnlyFunctionParameterCollection {
    readonly all: readonly IFunctionParameter[];
}

export interface IFunctionParameterCollection extends IReadOnlyFunctionParameterCollection {
    addParameter(parameter: IFunctionParameter): void;
}
