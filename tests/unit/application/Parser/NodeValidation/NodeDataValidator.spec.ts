import { describe, it, expect } from 'vitest';
import { CategoryDataStub } from '@tests/unit/shared/Stubs/CategoryDataStub';
import type { NodeData } from '@/application/Parser/NodeValidation/NodeData';
import { createNodeDataErrorContextStub } from '@tests/unit/shared/Stubs/NodeDataErrorContextStub';
import type { NodeDataErrorContext } from '@/application/Parser/NodeValidation/NodeDataErrorContext';
import { collectExceptionMessage } from '@tests/unit/shared/ExceptionCollector';
import { ContextualNodeDataValidator, createNodeDataValidator, type NodeDataValidator } from '@/application/Parser/NodeValidation/NodeDataValidator';
import type { NodeContextErrorMessageCreator } from '@/application/Parser/NodeValidation/NodeDataErrorContextMessage';
import { getAbsentObjectTestCases, getAbsentStringTestCases } from '@tests/unit/shared/TestCases/AbsentTests';

describe('createNodeDataValidator', () => {
  it(`returns an instance of ${ContextualNodeDataValidator.name}`, () => {
    // arrange
    const context = createNodeDataErrorContextStub();
    // act
    const validator = createNodeDataValidator(context);
    // assert
    expect(validator).to.be.instanceOf(ContextualNodeDataValidator);
  });
});

describe('NodeDataValidator', () => {
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
      const sut = new NodeValidatorBuilder()
        .build();
      // act
      const act = () => sut.assertValidName(validName);
      // assert
      expect(act).to.not.throw();
    });
  });
  describe('assertDefined', () => {
    describe('throws when node data is missing', () => {
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
          const expectedMessage = 'missing node data';
          itThrowsCorrectly({
            // act
            throwingAction: (sut: NodeDataValidator) => {
              sut.assertDefined(invalidData as NodeData);
            },
            // assert
            expectedMessage,
          });
        });
      });
    });
    it('does not throw if node data is defined', () => {
      // arrange
      const definedNode = new CategoryDataStub();
      const sut = new NodeValidatorBuilder()
        .build();
      // act
      const act = () => sut.assertDefined(definedNode);
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
        throwingAction: (sut: NodeDataValidator) => {
          sut.assert(falsePredicate, expectedErrorMessage);
        },
        // assert
        expectedMessage: expectedErrorMessage,
      });
    });
    it('does not throw if validation succeeds', () => {
      // arrange
      const truePredicate = () => true;
      const sut = new NodeValidatorBuilder()
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
      const errorMessageBuilder: NodeContextErrorMessageCreator = (message) => message;
      const sut = new NodeValidatorBuilder()
        .withErrorMessageCreator(errorMessageBuilder)
        .build();
      // act
      const actualErrorMessage = sut.createContextualErrorMessage(expectedErrorMessage);
      // assert
      expect(actualErrorMessage).to.equal(expectedErrorMessage);
    });
    it('creates using the correct context', () => {
      // arrange
      const expectedContext = createNodeDataErrorContextStub();
      let actualContext: NodeDataErrorContext | undefined;
      const errorMessageBuilder: NodeContextErrorMessageCreator = (_, context) => {
        actualContext = context;
        return '';
      };
      const sut = new NodeValidatorBuilder()
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
  sut: ContextualNodeDataValidator,
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
    const errorMessageBuilder: NodeContextErrorMessageCreator = () => expectedErrorMessage;
    const sut = new NodeValidatorBuilder()
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
    const errorMessageBuilder: NodeContextErrorMessageCreator = (message) => message;
    const sut = new NodeValidatorBuilder()
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
    const expectedContext = createNodeDataErrorContextStub();
    const serializeContext = (context: NodeDataErrorContext) => JSON.stringify(context);
    const errorMessageBuilder:
    NodeContextErrorMessageCreator = (_, context) => serializeContext(context);
    const sut = new NodeValidatorBuilder()
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

class NodeValidatorBuilder {
  private errorContext: NodeDataErrorContext = createNodeDataErrorContextStub();

  private errorMessageCreator: NodeContextErrorMessageCreator = () => `[${NodeValidatorBuilder.name}] stub error message`;

  public withErrorMessageCreator(errorMessageCreator: NodeContextErrorMessageCreator): this {
    this.errorMessageCreator = errorMessageCreator;
    return this;
  }

  public withContext(errorContext: NodeDataErrorContext): this {
    this.errorContext = errorContext;
    return this;
  }

  public build(): ContextualNodeDataValidator {
    return new ContextualNodeDataValidator(
      this.errorContext,
      this.errorMessageCreator,
    );
  }
}
