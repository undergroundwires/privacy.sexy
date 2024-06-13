import type { ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { indentText } from '@tests/shared/Text';
import { ErrorWrapperStub } from '@tests/unit/shared/Stubs/ErrorWrapperStub';

interface ContextualErrorTestScenario {
  readonly throwingAction: (wrapError: ErrorWithContextWrapper) => void;
  readonly expectedWrappedError: Error;
  readonly expectedContextMessage: string;
}

export function itThrowsContextualError(
  testScenario: ContextualErrorTestScenario,
) {
  it('throws wrapped error', () => {
    // arrange
    const expectedError = new Error();
    const wrapperStub = new ErrorWrapperStub()
      .withError(expectedError);
    // act
    const act = () => testScenario.throwingAction(wrapperStub.get());
    // assert
    expect(act).to.throw(expectedError);
  });
  it('wraps internal error', () => {
    // arrange
    const expectedInternalError = testScenario.expectedWrappedError;
    const wrapperStub = new ErrorWrapperStub();
    // act
    try {
      testScenario.throwingAction(wrapperStub.get());
    } catch { /* Swallow */ }
    // assert
    expect(wrapperStub.lastError).to.deep.equal(expectedInternalError);
  });
  it('includes expected context', () => {
    // arrange
    const { expectedContextMessage: expectedContext } = testScenario;
    const wrapperStub = new ErrorWrapperStub();
    // act
    try {
      testScenario.throwingAction(wrapperStub.get());
    } catch { /* Swallow */ }
    // assert
    expectExists(wrapperStub.lastContext);
    expect(wrapperStub.lastContext).to.equal(expectedContext, formatAssertionMessage([
      'Unexpected additional context (additional message added to the wrapped error).',
      `Actual additional context:\n${indentText(wrapperStub.lastContext)}`,
      `Expected additional context:\n${indentText(expectedContext)}`,
    ]));
  });
}
