import { describe, it, expect } from 'vitest';
import { CustomError } from '@/application/Common/CustomError';
import { wrapErrorWithAdditionalContext } from '@/application/Parser/Common/ContextualError';
import { splitTextIntoLines } from '@/application/Common/Text/SplitTextIntoLines';

describe('wrapErrorWithAdditionalContext', () => {
  it('preserves the original error when wrapped', () => {
    // arrange
    const expectedError = new Error();
    const context = new TestContext()
      .withError(expectedError);
    // act
    const error = context.wrap();
    // assert
    const actualError = extractInnerErrorFromContextualError(error);
    expect(actualError).to.equal(expectedError);
  });
  it('maintains the original error when re-wrapped', () => {
    // arrange
    const expectedError = new Error();

    // act
    const firstError = new TestContext()
      .withError(expectedError)
      .withAdditionalContext('first error')
      .wrap();
    const secondError = new TestContext()
      .withError(firstError)
      .withAdditionalContext('second error')
      .wrap();

    // assert
    const actualError = extractInnerErrorFromContextualError(secondError);
    expect(actualError).to.equal(expectedError);
  });
  it(`the object extends ${CustomError.name}`, () => {
    // arrange
    const expected = CustomError;
    // act
    const error = new TestContext()
      .wrap();
    // assert
    expect(error).to.be.an.instanceof(expected);
  });
  describe('error message construction', () => {
    it('includes the message from the original error', () => {
      // arrange
      const expectedOriginalErrorMessage = 'Message from the inner error';

      // act
      const error = new TestContext()
        .withError(new Error(expectedOriginalErrorMessage))
        .wrap();

      // assert
      expect(error.message).contains(expectedOriginalErrorMessage);
    });
    it('appends provided additional context to the error message', () => {
      // arrange
      const expectedAdditionalContext = 'Expected additional context message';

      // act
      const error = new TestContext()
        .withAdditionalContext(expectedAdditionalContext)
        .wrap();

      // assert
      expect(error.message).contains(expectedAdditionalContext);
    });
    it('appends multiple contexts to the error message in sequential order', () => {
      // arrange
      const expectedFirstContext = 'First context';
      const expectedSecondContext = 'Second context';

      // act
      const firstError = new TestContext()
        .withAdditionalContext(expectedFirstContext)
        .wrap();
      const secondError = new TestContext()
        .withError(firstError)
        .withAdditionalContext(expectedSecondContext)
        .wrap();

      // assert
      const messageLines = splitTextIntoLines(secondError.message);
      expect(messageLines).to.contain(`1: ${expectedFirstContext}`);
      expect(messageLines).to.contain(`2: ${expectedSecondContext}`);
    });
  });
});

class TestContext {
  private error: Error = new Error();

  private additionalContext = `[${TestContext.name}] additional context`;

  public withError(error: Error) {
    this.error = error;
    return this;
  }

  public withAdditionalContext(additionalContext: string) {
    this.additionalContext = additionalContext;
    return this;
  }

  public wrap(): ReturnType<typeof wrapErrorWithAdditionalContext> {
    return wrapErrorWithAdditionalContext(
      this.error,
      this.additionalContext,
    );
  }
}

function extractInnerErrorFromContextualError(error: Error): Error {
  const innerErrorProperty = 'innerError';
  if (!(innerErrorProperty in error)) {
    throw new Error(`${innerErrorProperty} property is missing`);
  }
  const actualError = error[innerErrorProperty];
  return actualError as Error;
}
