import { expect } from 'vitest';

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
  expect(error).toBeDefined();
  expect(error).to.be.an(Error.name);
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
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
