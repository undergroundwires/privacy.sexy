import { expect } from 'vitest';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

export async function expectThrowsAsync(
  method: () => Promise<unknown>,
  errorMessage: string,
) {
  let error: unknown;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expectExists(error);
  expect(error).to.be.an(Error.name);
  if (!(error instanceof Error)) {
    throw new Error('Expected an Error to be thrown.');
  }
  expect(error.message).to.equal(errorMessage);
}

export async function expectDoesNotThrowAsync(
  method: () => Promise<unknown>,
) {
  let error: unknown;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).toBeUndefined();
}
