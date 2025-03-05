import { describe, expect, it } from 'vitest';
import { createFunctionCallArgument } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Argument/FunctionCallArgument';
import { TypeValidatorStub } from '@tests/unit/shared/Stubs/TypeValidatorStub';
import type { NonEmptyStringAssertion, TypeValidator } from '@/application/Common/TypeValidator';
import { createParameterNameValidatorStub } from '@tests/unit/shared/Stubs/ParameterNameValidatorStub';
import type { ParameterNameValidator } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Shared/ParameterNameValidator';

describe('FunctionCallArgument', () => {
  describe('createFunctionCallArgument', () => {
    describe('parameter name', () => {
      it('assigns correctly', () => {
        // arrange
        const expectedName = 'expected parameter name';
        const context = new TestContext()
          .withParameterName(expectedName);
        // act
        const actualArgument = context.create();
        // assert
        const actualName = actualArgument.parameterName;
        expect(actualName).toEqual(expectedName);
      });
      it('validates parameter name', () => {
        // arrange
        const validator = createParameterNameValidatorStub();
        const expectedParameterName = 'parameter name expected to be validated';
        const context = new TestContext()
          .withParameterName(expectedParameterName)
          .withParameterNameValidator(validator.validator);
        // act
        context.create();
        // assert
        expect(validator.validatedNames).to.have.lengthOf(1);
        expect(validator.validatedNames).to.include(expectedParameterName);
      });
    });
    describe('argument value', () => {
      it('assigns correctly', () => {
        // arrange
        const expectedValue = 'expected argument value';
        const context = new TestContext()
          .withArgumentValue(expectedValue);
        // act
        const actualArgument = context.create();
        // assert
        const actualValue = actualArgument.argumentValue;
        expect(actualValue).toEqual(expectedValue);
      });
      it('validates argument value', () => {
        // arrange
        const parameterNameInError = 'expected parameter with argument error';
        const expectedArgumentValue = 'argument value to be validated';
        const expectedAssertion: NonEmptyStringAssertion = {
          value: expectedArgumentValue,
          valueName: `Missing argument value for the parameter "${parameterNameInError}".`,
        };
        const typeValidator = new TypeValidatorStub();
        const context = new TestContext()
          .withArgumentValue(expectedArgumentValue)
          .withParameterName(parameterNameInError)
          .withTypeValidator(typeValidator);
        // act
        context.create();
        // assert
        typeValidator.assertNonEmptyString(expectedAssertion);
      });
    });
  });
});

class TestContext {
  private parameterName = `[${TestContext.name}] default-parameter-name`;

  private argumentValue = `[${TestContext.name}] default-argument-value`;

  private typeValidator: TypeValidator = new TypeValidatorStub();

  private parameterNameValidator
  : ParameterNameValidator = createParameterNameValidatorStub().validator;

  public withParameterName(parameterName: string): this {
    this.parameterName = parameterName;
    return this;
  }

  public withArgumentValue(argumentValue: string): this {
    this.argumentValue = argumentValue;
    return this;
  }

  public withTypeValidator(typeValidator: TypeValidator): this {
    this.typeValidator = typeValidator;
    return this;
  }

  public withParameterNameValidator(parameterNameValidator: ParameterNameValidator): this {
    this.parameterNameValidator = parameterNameValidator;
    return this;
  }

  public create(): ReturnType<typeof createFunctionCallArgument> {
    return createFunctionCallArgument(
      this.parameterName,
      this.argumentValue,
      {
        typeValidator: this.typeValidator,
        validateParameterName: this.parameterNameValidator,
      },
    );
  }
}
