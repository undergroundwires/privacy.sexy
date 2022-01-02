import { ensureValidParameterName } from '../Shared/ParameterNameValidator';
import { IFunctionParameter } from './IFunctionParameter';

export class FunctionParameter implements IFunctionParameter {
  constructor(
    public readonly name: string,
    public readonly isOptional: boolean,
  ) {
    ensureValidParameterName(name);
  }
}
