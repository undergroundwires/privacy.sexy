import { IReadOnlyFunctionParameterCollection } from './Parameter/IFunctionParameterCollection';
import { FunctionCall } from './Call/FunctionCall';

export interface ISharedFunction {
  readonly name: string;
  readonly parameters: IReadOnlyFunctionParameterCollection;
  readonly body: SharedFunctionBody;
}

export interface CallFunctionBody {
  readonly type: FunctionBodyType.Calls,
  readonly calls: readonly FunctionCall[],
}

export interface CodeFunctionBody {
  readonly type: FunctionBodyType.Code;
  readonly code: IFunctionCode,
}

export type SharedFunctionBody = CallFunctionBody | CodeFunctionBody;

export enum FunctionBodyType {
  Code,
  Calls,
}

export interface IFunctionCode {
  readonly execute: string;
  readonly revert?: string;
}
