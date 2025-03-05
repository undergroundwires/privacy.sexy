import { describe, it, expect } from 'vitest';
import { CustomError } from '@/application/Common/CustomError';
import { wrapErrorWithAdditionalContext } from '@/application/Application/Loader/Collections/Compiler/Common/ContextualError';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { indentText } from '@/application/Common/Text/IndentText';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('wrapErrorWithAdditionalContext', () => {
  it(`extend ${CustomError.name}`, () => {
    // arrange
    const expected = CustomError;
    // act
    const error = new TestContext()
      .build();
    // assert
    expect(error).to.be.an.instanceof(expected);
  });
  describe('inner error preservation', () => {
    it('preserves the original error', () => {
      // arrange
      const expectedError = new Error();
      const context = new TestContext()
        .withInnerError(expectedError);
      // act
      const error = context.build();
      // assert
      const actualError = getInnerErrorFromContextualError(error);
      expect(actualError).to.equal(expectedError);
    });
    it('sets the original error as the cause', () => {
      // arrange
      const expectedError = new Error('error causing the issue');
      const context = new TestContext()
        .withInnerError(expectedError);
      // act
      const error = context.build();
      // assert
      const actualError = error.cause;
      expect(actualError).to.equal(expectedError);
    });
  });
  describe('error message construction', () => {
    it('includes the original error message', () => {
      // arrange
      const expectedOriginalErrorMessage = 'Message from the inner error';

      // act
      const error = new TestContext()
        .withInnerError(new Error(expectedOriginalErrorMessage))
        .build();

      // assert
      expect(error.message).contains(expectedOriginalErrorMessage);
    });
    it('includes original error toString() if message is absent', () => {
      // arrange
      const originalError = new Error();
      const expectedPartInMessage = originalError.toString();

      // act
      const error = new TestContext()
        .withInnerError(originalError)
        .build();

      // assert
      expect(error.message).contains(expectedPartInMessage);
    });
    it('appends additional context to the error message', () => {
      // arrange
      const expectedAdditionalContext = 'Expected additional context message';

      // act
      const error = new TestContext()
        .withAdditionalContext(expectedAdditionalContext)
        .build();

      // assert
      expect(error.message).contains(expectedAdditionalContext);
    });
    describe('message order', () => {
      it('displays the latest context before the original error message', () => {
        // arrange
        const originalErrorMessage = 'Original message from the inner error to be shown first';
        const additionalContext = 'Context to be displayed after';

        // act
        const error = new TestContext()
          .withInnerError(new Error(originalErrorMessage))
          .withAdditionalContext(additionalContext)
          .build();

        // assert
        expectMessageDisplayOrder(error.message, {
          firstMessage: additionalContext,
          secondMessage: originalErrorMessage,
        });
      });
      it('appends multiple contexts from most specific to most general', () => {
        // arrange
        const deepErrorContext = 'first-context';
        const parentErrorContext = 'second-context';

        // act
        const deepError = new TestContext()
          .withAdditionalContext(deepErrorContext)
          .build();
        const parentError = new TestContext()
          .withInnerError(deepError)
          .withAdditionalContext(parentErrorContext)
          .build();
        const grandParentError = new TestContext()
          .withInnerError(parentError)
          .withAdditionalContext('latest-error')
          .build();

        // assert
        expectMessageDisplayOrder(grandParentError.message, {
          firstMessage: deepErrorContext,
          secondMessage: parentErrorContext,
        });
      });
    });
  });
  describe('throws error when context is missing', () => {
    itEachAbsentStringValue((absentValue) => {
      // arrange
      const expectedError = 'Missing additional context';
      const context = new TestContext()
        .withAdditionalContext(absentValue);
      // act
      const act = () => context.build();
      // assert
      expect(act).to.throw(expectedError);
    }, { excludeNull: true, excludeUndefined: true });
  });
});

function expectMessageDisplayOrder(
  actualMessage: string,
  expectation: {
    readonly firstMessage: string;
    readonly secondMessage: string;
  },
): void {
  const firstMessageIndex = actualMessage.indexOf(expectation.firstMessage);
  const secondMessageIndex = actualMessage.indexOf(expectation.secondMessage);
  expect(firstMessageIndex).to.be.lessThan(secondMessageIndex, formatAssertionMessage([
    'Error output order does not match the expected order.',
    'Expected the first message to be displayed before the second message.',
    'Expected first message:',
    indentText(expectation.firstMessage),
    'Expected second message:',
    indentText(expectation.secondMessage),
    'Received message:',
    indentText(actualMessage),
  ]));
}

class TestContext {
  private innerError: Error = new Error(`[${TestContext.name}] original error`);

  private additionalContext = `[${TestContext.name}] additional context`;

  public withInnerError(innerError: Error) {
    this.innerError = innerError;
    return this;
  }

  public withAdditionalContext(additionalContext: string) {
    this.additionalContext = additionalContext;
    return this;
  }

  public build(): ReturnType<typeof wrapErrorWithAdditionalContext> {
    return wrapErrorWithAdditionalContext(
      this.innerError,
      this.additionalContext,
    );
  }
}

function getInnerErrorFromContextualError(error: Error & {
  readonly context?: {
    readonly innerError?: Error;
  },
}): Error {
  if (error?.context?.innerError instanceof Error) {
    return error.context.innerError;
  }
  throw new Error('Error must have a context with a valid innerError property.');
}
