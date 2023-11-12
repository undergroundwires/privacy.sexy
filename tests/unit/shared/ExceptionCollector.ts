export function collectExceptionMessage(action: () => unknown): string {
  let message: string | undefined;
  try {
    action();
  } catch (e) {
    message = e.message;
  }
  if (!message) {
    throw new Error('action did not throw');
  }
  return message;
}
