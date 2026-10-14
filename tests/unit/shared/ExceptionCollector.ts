export function collectExceptionMessage(action: () => unknown): string {
  return collectException(action).message;
}

function collectException(
  action: () => unknown,
): Error {
  let error: unknown;
  try {
    action();
  } catch (err) {
    error = err;
  }
  if (!error) {
    throw new Error('Action did not throw');
  }
  if (!(error instanceof Error)) {
    throw new Error('Action threw a non-Error value');
  }
  return error;
}

export async function collectExceptionAsync(
  action: () => Promise<unknown>,
): Promise<Error | undefined> {
  let error: unknown;
  try {
    await action();
  } catch (err) {
    error = err;
  }
  if (error !== undefined && !(error instanceof Error)) {
    throw new Error('Action threw a non-Error value');
  }
  return error;
}
