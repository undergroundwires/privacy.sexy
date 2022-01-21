import { expect } from 'chai';

export async function expectThrowsAsync(
  method: () => Promise<unknown>,
  errorMessage: string,
) {
  let error: Error;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).to.be.an(Error.name);
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
}
