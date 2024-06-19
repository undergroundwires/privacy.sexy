import { createTypeValidator, type TypeValidator } from '@/application/Parser/Common/TypeValidator';

export interface ParameterNameValidator {
  (
    parameterName: string,
    typeValidator?: TypeValidator,
  ): void;
}

export const validateParameterName = (
  parameterName: string,
  typeValidator = createTypeValidator(),
) => {
  typeValidator.assertNonEmptyString({
    value: parameterName,
    valueName: 'parameter name',
    rule: {
      expectedMatch: /^[0-9a-zA-Z]+$/,
      errorMessage: `parameter name must be alphanumeric but it was "${parameterName}".`,
    },
  });
};
