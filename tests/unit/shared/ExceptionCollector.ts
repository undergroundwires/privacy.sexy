export function collectExceptionMessage(action: () => unknown): string {
  return collectException(action).message;
}

function collectException(
  action: () => unknown,
): Error {
  let error: Error | undefined;
  try {
    action();
  } catch (err) {
    error = err;
  }
  if (!error) {
    throw new Error('Action did not throw');
  }
  return error;
}

export async function collectExceptionAsync(
  action: () => Promise<unknown>,
): Promise<Error | undefined> {
  let error: Error | undefined;
  try {
    await action();
  } catch (err) {
    error = err;
  }
  return error;
}
