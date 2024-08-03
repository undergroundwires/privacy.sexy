import { describe, it, expect } from 'vitest';
import { CategoryDataStub } from '@tests/unit/shared/Stubs/CategoryDataStub';
import type { ExecutableData } from '@/application/collections/';
import { createExecutableErrorContextStub } from '@tests/unit/shared/Stubs/ExecutableErrorContextStub';
import type { ExecutableErrorContext } from '@/application/Parser/Executable/Validation/ExecutableErrorContext';
import { collectExceptionMessage } from '@tests/unit/shared/ExceptionCollector';
import { ContextualExecutableValidator, createExecutableDataValidator, type ExecutableValidator } from '@/application/Parser/Executable/Validation/ExecutableValidator';
import type { ExecutableContextErrorMessageCreator } from '@/application/Parser/Executable/Validation/ExecutableErrorContextMessage';
import { getAbsentObjectTestCases, getAbsentStringTestCases } from '@tests/unit/shared/TestCases/AbsentTests';

describe('createExecutableDataValidator', () => {
  it(`returns an instance of ${ContextualExecutableValidator.name}`, () => {
    // arrange
    const context = createExecutableErrorContextStub();
    // act
    const validator = createExecutableDataValidator(context);
    // assert
    expect(validator).to.be.instanceOf(ContextualExecutableValidator);
  });
});

describe('ContextualExecutableValidator', () => {
  describe('assertValidName', () => {
    describe('throws when name is invalid', () => {
      // arrange
      const testScenarios: readonly {
        readonly description: string;
        readonly invalidName: unknown;
        readonly expectedMessage: string;
      }[] = [
        ...getAbsentStringTestCases().map((testCase) => ({
          description: `missing name (${testCase.valueName})`,
          invalidName: testCase.absentValue,
          expectedMessage: 'missing name',
        })),
        {
          description: 'invalid type',
          invalidName: 33,
          expectedMessage: 'Name (33) is not a string but number.',
        },
      ];
      testScenarios.forEach(({ description, invalidName, expectedMessage }) => {
        describe(`given "${description}"`, () => {
          itThrowsCorrectly({
            // act
            throwingAction: (sut) => {
              sut.assertValidName(invalidName as string);
            },
            // assert
            expectedMessage,
          });
        });
      });
    });
    it('does not throw when name is valid', () => {
      // arrange
      const validName = 'validName';
      const sut = new ValidatorBuilder()
        .build();
      // act
      const act = () => sut.assertValidName(validName);
      // assert
      expect(act).to.not.throw();
    });
  });
  describe('assertDefined', () => {
    describe('throws when data is missing', () => {
      // arrange
      const testScenarios: readonly {
        readonly description: string;
        readonly invalidData: unknown;
      }[] = [
        ...getAbsentObjectTestCases().map((testCase) => ({
          description: `absent object (${testCase.valueName})`,
          invalidData: testCase.absentValue,
        })),
        {
          description: 'empty object',
          invalidData: {},
        },
      ];
      testScenarios.forEach(({ description, invalidData }) => {
        describe(`given "${description}"`, () => {
          const expectedMessage = 'missing executable data';
          itThrowsCorrectly({
            // act
            throwingAction: (sut: ExecutableValidator) => {
              sut.assertDefined(invalidData as ExecutableData);
            },
            // assert
            expectedMessage,
          });
        });
      });
    });
    it('does not throw if data is defined', () => {
      // arrange
      const data = new CategoryDataStub();
      const sut = new ValidatorBuilder()
        .build();
      // act
      const act = () => sut.assertDefined(data);
      // assert
      expect(act).to.not.throw();
    });
  });
  describe('assert', () => {
    describe('throws if validation fails', () => {
      const falsePredicate = () => false;
      const expectedErrorMessage = 'expected error';
      // assert
      itThrowsCorrectly({
        // act
        throwingAction: (sut: ExecutableValidator) => {
          sut.assert(falsePredicate, expectedErrorMessage);
        },
        // assert
        expectedMessage: expectedErrorMessage,
      });
    });
    it('does not throw if validation succeeds', () => {
      // arrange
      const truePredicate = () => true;
      const sut = new ValidatorBuilder()
        .build();
      // act
      const act = () => sut.assert(truePredicate, 'ignored error');
      // assert
      expect(act).to.not.throw();
    });
  });
  describe('createContextualErrorMessage', () => {
    it('creates using the correct error message', () => {
      // arrange
      const expectedErrorMessage = 'expected error';
      const errorMessageBuilder: ExecutableContextErrorMessageCreator = (message) => message;
      const sut = new ValidatorBuilder()
        .withErrorMessageCreator(errorMessageBuilder)
        .build();
      // act
      const actualErrorMessage = sut.createContextualErrorMessage(expectedErrorMessage);
      // assert
      expect(actualErrorMessage).to.equal(expectedErrorMessage);
    });
    it('creates using the correct context', () => {
      // arrange
      const expectedContext = createExecutableErrorContextStub();
      let actualContext: ExecutableErrorContext | undefined;
      const errorMessageBuilder: ExecutableContextErrorMessageCreator = (_, context) => {
        actualContext = context;
        return '';
      };
      const sut = new ValidatorBuilder()
        .withContext(expectedContext)
        .withErrorMessageCreator(errorMessageBuilder)
        .build();
      // act
      sut.createContextualErrorMessage('unimportant');
      // assert
      expect(actualContext).to.equal(expectedContext);
    });
  });
});

type ValidationThrowingFunction = (
  sut: ContextualExecutableValidator,
) => void;

interface ValidationThrowingTestScenario {
  readonly throwingAction: ValidationThrowingFunction,
  readonly expectedMessage: string;
}

function itThrowsCorrectly(
  testScenario: ValidationThrowingTestScenario,
): void {
  it('throws an error', () => {
    // arrange
    const expectedErrorMessage = 'Injected error message';
    const errorMessageBuilder: ExecutableContextErrorMessageCreator = () => expectedErrorMessage;
    const sut = new ValidatorBuilder()
      .withErrorMessageCreator(errorMessageBuilder)
      .build();
    // act
    const action = () => testScenario.throwingAction(sut);
    // assert
    expect(action).to.throw();
  });
  it('throws with the correct error message', () => {
    // arrange
    const expectedErrorMessage = testScenario.expectedMessage;
    const errorMessageBuilder: ExecutableContextErrorMessageCreator = (message) => message;
    const sut = new ValidatorBuilder()
      .withErrorMessageCreator(errorMessageBuilder)
      .build();
    // act
    const action = () => testScenario.throwingAction(sut);
    // assert
    const actualErrorMessage = collectExceptionMessage(action);
    expect(actualErrorMessage).to.equal(expectedErrorMessage);
  });
  it('throws with the correct context', () => {
    // arrange
    const expectedContext = createExecutableErrorContextStub();
    const serializeContext = (context: ExecutableErrorContext) => JSON.stringify(context);
    const errorMessageBuilder:
    ExecutableContextErrorMessageCreator = (_, context) => serializeContext(context);
    const sut = new ValidatorBuilder()
      .withContext(expectedContext)
      .withErrorMessageCreator(errorMessageBuilder)
      .build();
    // act
    const action = () => testScenario.throwingAction(sut);
    // assert
    const expectedSerializedContext = serializeContext(expectedContext);
    const actualSerializedContext = collectExceptionMessage(action);
    expect(expectedSerializedContext).to.equal(actualSerializedContext);
  });
}

class ValidatorBuilder {
  private errorContext: ExecutableErrorContext = createExecutableErrorContextStub();

  private errorMessageCreator: ExecutableContextErrorMessageCreator = () => `[${ValidatorBuilder.name}] stub error message`;

  public withErrorMessageCreator(errorMessageCreator: ExecutableContextErrorMessageCreator): this {
    this.errorMessageCreator = errorMessageCreator;
    return this;
  }

  public withContext(errorContext: ExecutableErrorContext): this {
    this.errorContext = errorContext;
    return this;
  }

  public build(): ContextualExecutableValidator {
    return new ContextualExecutableValidator(
      this.errorContext,
      this.errorMessageCreator,
    );
  }
}
