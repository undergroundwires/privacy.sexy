import { describe, it, expect } from 'vitest';
import type { ParameterDefinitionData } from '@/application/collections/';
import type { ParameterNameValidator } from '@/application/Parser/Executable/Script/Compiler/Function/Shared/ParameterNameValidator';
import { createParameterNameValidatorStub } from '@tests/unit/shared/Stubs/ParameterNameValidatorStub';
import { parseFunctionParameter } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/FunctionParameterParser';
import { ParameterDefinitionDataStub } from '@tests/unit/shared/Stubs/ParameterDefinitionDataStub';

describe('FunctionParameterParser', () => {
  describe('parseFunctionParameter', () => {
    describe('name', () => {
      it('assigns correctly', () => {
        // arrange
        const expectedName = 'expected-function-name';
        const data = new ParameterDefinitionDataStub()
          .withName(expectedName);
        // act
        const actual = new TestContext()
          .withData(data)
          .parse();
        // expect
        const actualName = actual.name;
        expect(actualName).to.equal(expectedName);
      });
      it('validates correctly', () => {
        // arrange
        const expectedName = 'expected-function-name';
        const { validator, validatedNames } = createParameterNameValidatorStub();
        const data = new ParameterDefinitionDataStub()
          .withName(expectedName);
        // act
        new TestContext()
          .withData(data)
          .withValidator(validator)
          .parse();
        // expect
        expect(validatedNames).to.have.lengthOf(1);
        expect(validatedNames).to.contain(expectedName);
      });
    });
    describe('isOptional', () => {
      describe('assigns correctly', () => {
        // arrange
        const expectedValues = [true, false];
        for (const expected of expectedValues) {
          it(expected.toString(), () => {
            const data = new ParameterDefinitionDataStub()
              .withOptionality(expected);
            // act
            const actual = new TestContext()
              .withData(data)
              .parse();
            // expect
            expect(actual.isOptional).to.equal(expected);
          });
        }
      });
    });
  });
});

class TestContext {
  private data: ParameterDefinitionData = new ParameterDefinitionDataStub()
    .withName(`[${TestContext.name}]function-name`);

  private validator: ParameterNameValidator = createParameterNameValidatorStub().validator;

  public withData(data: ParameterDefinitionData) {
    this.data = data;
    return this;
  }

  public withValidator(parameterNameValidator: ParameterNameValidator): this {
    this.validator = parameterNameValidator;
    return this;
  }

  public parse() {
    return parseFunctionParameter(
      this.data,
      this.validator,
    );
  }
}
