import { IReadOnlyFunctionParameterCollection } from './Parameter/IFunctionParameterCollection';
import { FunctionCall } from './Call/FunctionCall';

export interface ISharedFunction {
  readonly name: string;
  readonly parameters: IReadOnlyFunctionParameterCollection;
  readonly body: ISharedFunctionBody;
}

export interface ISharedFunctionBody {
  readonly type: FunctionBodyType;
  readonly code: IFunctionCode | undefined;
  readonly calls: readonly FunctionCall[] | undefined;
}

export enum FunctionBodyType {
  Code,
  Calls,
}

export interface IFunctionCode {
  readonly execute: string;
  readonly revert?: string;
}
