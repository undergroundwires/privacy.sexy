import { describe, expect, it } from 'vitest';
import { expectThrowsAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';

describe('expectThrowsAsync', () => {
  it('rejects a non-Error rejection', async () => {
    // arrange
    const action = () => expectThrowsAsync(async () => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- Invalid throw fixture.
      throw 'not an Error';
    }, 'not an Error');

    // act
    const outcome = action();

    // assert
    await expect(outcome).rejects.toThrow();
  });
});
