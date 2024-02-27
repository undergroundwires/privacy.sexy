import { ensureValidParameterName } from '../Shared/ParameterNameValidator';
import type { IFunctionParameter } from './IFunctionParameter';

export class FunctionParameter implements IFunctionParameter {
  constructor(
    public readonly name: string,
    public readonly isOptional: boolean,
  ) {
    ensureValidParameterName(name);
  }
}
