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
    throw new Error('action did not throw');
  }
  return error;
}
