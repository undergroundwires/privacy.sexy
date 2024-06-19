import { createTypeValidator, type TypeValidator } from '@/application/Parser/Common/TypeValidator';
import { validateParameterName, type ParameterNameValidator } from '@/application/Parser/Executable/Script/Compiler/Function/Shared/ParameterNameValidator';

export interface FunctionCallArgument {
  readonly parameterName: string;
  readonly argumentValue: string;
}

export interface FunctionCallArgumentFactory {
  (
    parameterName: string,
    argumentValue: string,
    utilities?: FunctionCallArgumentFactoryUtilities,
  ): FunctionCallArgument;
}

export const createFunctionCallArgument: FunctionCallArgumentFactory = (
  parameterName: string,
  argumentValue: string,
  utilities: FunctionCallArgumentFactoryUtilities = DefaultUtilities,
): FunctionCallArgument => {
  utilities.validateParameterName(parameterName);
  utilities.typeValidator.assertNonEmptyString({
    value: argumentValue,
    valueName: `Missing argument value for the parameter "${parameterName}".`,
  });
  return {
    parameterName,
    argumentValue,
  };
};

interface FunctionCallArgumentFactoryUtilities {
  readonly typeValidator: TypeValidator;
  readonly validateParameterName: ParameterNameValidator;
}

const DefaultUtilities: FunctionCallArgumentFactoryUtilities = {
  typeValidator: createTypeValidator(),
  validateParameterName,
};
