import { it } from 'vitest';
import type { ExecutableValidator, ExecutableValidatorFactory } from '@/application/Parser/Executable/Validation/ExecutableValidator';
import type { ExecutableErrorContext } from '@/application/Parser/Executable/Validation/ExecutableErrorContext';
import { ExecutableValidatorStub } from '@tests/unit/shared/Stubs/ExecutableValidatorStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import type { ExecutableData } from '@/application/collections/';
import type { FunctionKeys } from '@/TypeHelpers';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
<<<<<<< HEAD
import { TypeValidatorStub } from '@tests/unit/shared/Stubs/TypeValidatorStub';
import { expectDeepIncludes } from '@tests/shared/Assertions/ExpectDeepIncludes';
import { indentText } from '@/application/Common/Text/IndentText';
=======
import { indentText } from '@tests/shared/Text';
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)

type ValidationTestFunction<TExpectation> = (
  factory: ExecutableValidatorFactory,
) => TExpectation;

interface ValidNameExpectation {
  readonly expectedNameToValidate: string;
  readonly expectedErrorContext: ExecutableErrorContext;
}

export function itValidatesName(
  test: ValidationTestFunction<ValidNameExpectation>,
) {
  it('validates for name', () => {
    // arrange
    const validator = new ExecutableValidatorStub();
    const factoryStub: ExecutableValidatorFactory = () => validator;
    // act
    test(factoryStub);
    // assert
    const call = validator.callHistory.find((c) => c.methodName === 'assertValidName');
    expectExists(call);
  });
  it('validates for name with correct name', () => {
    // arrange
    const validator = new ExecutableValidatorStub();
    const factoryStub: ExecutableValidatorFactory = () => validator;
    // act
    const expectation = test(factoryStub);
    // assert
    const expectedName = expectation.expectedNameToValidate;
    const names = validator.callHistory
      .filter((c) => c.methodName === 'assertValidName')
      .flatMap((c) => c.args[0]);
    expect(names).to.include(expectedName);
  });
  it('validates for name with correct context', () => {
    expectCorrectContextForFunctionCall({
      methodName: 'assertValidName',
      act: test,
      expectContext: (expectation) => expectation.expectedErrorContext,
    });
  });
}

interface ValidDataExpectation {
  readonly expectedDataToValidate: ExecutableData;
  readonly expectedErrorContext: ExecutableErrorContext;
}

export function itValidatesDefinedData(
  test: ValidationTestFunction<ValidDataExpectation>,
) {
  it('validates data', () => {
    // arrange
    const validator = new ExecutableValidatorStub();
    const factoryStub: ExecutableValidatorFactory = () => validator;
    // act
    test(factoryStub);
    // assert
    const call = validator.callHistory.find((c) => c.methodName === 'assertDefined');
    expectExists(call);
  });
  it('validates data with correct data', () => {
    // arrange
    const validator = new ExecutableValidatorStub();
    const factoryStub: ExecutableValidatorFactory = () => validator;
    // act
    const expectation = test(factoryStub);
    // assert
    const expectedData = expectation.expectedDataToValidate;
    const calls = validator.callHistory.filter((c) => c.methodName === 'assertDefined');
    const names = calls.flatMap((c) => c.args[0]);
    expect(names).to.include(expectedData);
  });
  it('validates data with correct context', () => {
    expectCorrectContextForFunctionCall({
      methodName: 'assertDefined',
      act: test,
      expectContext: (expectation) => expectation.expectedErrorContext,
    });
  });
}

interface AssertionExpectation {
  readonly expectedErrorMessage: string;
  readonly expectedErrorContext: ExecutableErrorContext;
}

export function itAsserts(
  testScenario: {
    readonly test: ValidationTestFunction<AssertionExpectation>,
    readonly expectedConditionResult: boolean;
  },
) {
  it('asserts with correct message', () => {
    // arrange
    const validator = new ExecutableValidatorStub()
      .withAssertThrowsOnFalseCondition(false);
    const factoryStub: ExecutableValidatorFactory = () => validator;
    // act
    const expectation = testScenario.test(factoryStub);
    // assert
    const expectedError = expectation.expectedErrorMessage;
    const calls = validator.callHistory.filter((c) => c.methodName === 'assert');
    const actualMessages = calls.map((call) => {
      const [, message] = call.args;
      return message;
    });
    expect(actualMessages).to.include(expectedError, formatAssertionMessage([
      'Assertion failed: The expected error message was not triggered.',
      `Expected: "${expectedError}"`,
      'Actual messages (none match expected):',
      indentText(actualMessages.map((message) => `- ${message}`).join('\n')),
    ]));
  });
  it('asserts with correct context', () => {
    expectCorrectContextForFunctionCall({
      methodName: 'assert',
      act: testScenario.test,
      expectContext: (expectation) => expectation.expectedErrorContext,
    });
  });
  it('asserts with correct condition result', () => {
    // arrange
    const expectedEvaluationResult = testScenario.expectedConditionResult;
    const validator = new ExecutableValidatorStub()
      .withAssertThrowsOnFalseCondition(false);
    const factoryStub: ExecutableValidatorFactory = () => validator;
    // act
    const expectation = testScenario.test(factoryStub);
    // assert
    const assertCalls = validator.callHistory
      .filter((call) => call.methodName === 'assert');
    expect(assertCalls).to.have.length.greaterThan(0);
    const assertCallsWithMessage = assertCalls
      .filter((call) => {
        const [, message] = call.args;
        return message === expectation.expectedErrorMessage;
      });
    expect(assertCallsWithMessage).to.have.length.greaterThan(0);
    const evaluationResults = assertCallsWithMessage
      .map((call) => {
        const [predicate] = call.args;
        return predicate as (() => boolean);
      })
      .map((predicate) => predicate());
    expect(evaluationResults).to.include(expectedEvaluationResult);
  });
}

function expectCorrectContextForFunctionCall<T>(testScenario: {
  methodName: FunctionKeys<ExecutableValidator>,
  act: ValidationTestFunction<T>,
  expectContext: (actionResult: T) => ExecutableErrorContext,
}) {
  // arrange
  const { methodName } = testScenario;
  const createdValidators = new Array<{
    readonly validator: ExecutableValidatorStub;
    readonly context: ExecutableErrorContext;
  }>();
  const factoryStub: ExecutableValidatorFactory = (context) => {
    const validator = new ExecutableValidatorStub()
      .withAssertThrowsOnFalseCondition(false);
    createdValidators.push(({
      validator,
      context,
    }));
    return validator;
  };
  // act
  const actionResult = testScenario.act(factoryStub);
  // assert
  const expectedContext = testScenario.expectContext(actionResult);
  const providedContexts = createdValidators
    .filter((v) => v.validator.callHistory.find((c) => c.methodName === methodName))
    .map((v) => v.context);
  expectDeepIncludes( // to.deep.include is not working
    providedContexts,
    expectedContext,
    formatAssertionMessage([
      'Error context mismatch.',
      'Provided contexts do not include the expected context.',
      'Expected context:',
      indentText(JSON.stringify(expectedContext, undefined, 2)),
      'Provided contexts:',
      indentText(JSON.stringify(providedContexts, undefined, 2)),
    ]),
  );
}

function expectDeepIncludes<T>(
  array: readonly T[],
  item: T,
  message: string,
) {
  const serializeItem = (c) => JSON.stringify(c);
  const serializedContexts = array.map((c) => serializeItem(c));
  const serializedExpectedContext = serializeItem(item);
  expect(serializedContexts).to.include(serializedExpectedContext, formatAssertionMessage([
    'Error context mismatch.',
    'Provided contexts do not include the expected context.',
    'Expected context:',
    indentText(JSON.stringify(message, undefined, 2)),
    'Provided contexts:',
    indentText(JSON.stringify(message, undefined, 2)),
  ]));
}
