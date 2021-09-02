import { IFunctionParameter } from './IFunctionParameter';
import { ensureValidParameterName } from '../../ParameterNameValidator';

export class FunctionParameter implements IFunctionParameter {
    constructor(
        public readonly name: string,
        public readonly isOptional: boolean) {
        ensureValidParameterName(name);
    }
}
