import { IFunctionCallArgument } from './IFunctionCallArgument';
import { ensureValidParameterName } from '../../ParameterNameValidator';

export class FunctionCallArgument implements IFunctionCallArgument {
    constructor(
        public readonly parameterName: string,
        public readonly argumentValue: string) {
        ensureValidParameterName(parameterName);
        if (!argumentValue) {
            throw new Error(`undefined argument value for "${parameterName}"`);
        }
    }
}
