import { IReadOnlyFunctionParameterCollection } from './Parameter/IFunctionParameterCollection';
import { IFunctionCall } from '../Function/Call/IFunctionCall';

export interface ISharedFunction {
    readonly name: string;
    readonly parameters: IReadOnlyFunctionParameterCollection;
    readonly body: ISharedFunctionBody;
}

export interface ISharedFunctionBody {
    readonly type: FunctionBodyType;
    readonly code: IFunctionCode;
    readonly calls: readonly IFunctionCall[];
}

export enum FunctionBodyType {
    Code,
    Calls,
}

export interface IFunctionCode {
    readonly do: string;
    readonly revert?: string;
}
