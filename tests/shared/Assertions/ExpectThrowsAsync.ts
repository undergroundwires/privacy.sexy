import { expect } from 'vitest';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

export async function expectThrowsAsync(
  method: () => Promise<unknown>,
  errorMessage: string,
) {
  let error: Error | undefined;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expectExists(error);
  expect(error).to.be.an(Error.name);
  expect(error.message).to.equal(errorMessage);
}

export async function expectDoesNotThrowAsync(
  method: () => Promise<unknown>,
) {
  let error: Error | undefined;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).toBeUndefined();
}
