import { describe, expect, it } from 'vitest';
import { collectExceptionAsync, collectExceptionMessage } from './ExceptionCollector';

describe('ExceptionCollector', () => {
  it('rejects a non-Error exception', () => {
    // arrange
    const action = () => collectExceptionMessage(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- Invalid throw fixture.
      throw 'not an Error';
    });

    expect(action).to.throw();
  });

  it('rejects a non-Error asynchronous exception', async () => {
    // arrange
    const action = () => collectExceptionAsync(async () => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- Invalid throw fixture.
      throw 'not an Error';
    });

    // act
    const outcome = action();

    // assert
    await expect(outcome).rejects.toThrow();
  });
});
