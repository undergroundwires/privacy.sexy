import { describe, it } from 'vitest';
import { TypeValidatorStub } from '@tests/unit/shared/Stubs/TypeValidatorStub';
import { validateParameterName } from '@/application/Parser/Executable/Script/Compiler/Function/Shared/ParameterNameValidator';
import type { NonEmptyStringAssertion } from '@/application/Compiler/Common/TypeValidator';

describe('ParameterNameValidator', () => {
  it('asserts correctly', () => {
    // arrange
    const parameterName = 'expected-parameter-name';
    const validator = new TypeValidatorStub();
    const expectedAssertion: NonEmptyStringAssertion = {
      value: parameterName,
      valueName: 'parameter name',
      rule: {
        expectedMatch: /^[0-9a-zA-Z]+$/,
        errorMessage: `parameter name must be alphanumeric but it was "${parameterName}".`,
      },
    };
    // act
    validateParameterName(parameterName, validator);
    // assert
    validator.assertNonEmptyString(expectedAssertion);
  });
});
