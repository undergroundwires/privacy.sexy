export function createMockTimeout(timerId: number): ReturnType<typeof setTimeout> {
  const throwErrorForNodeOperation = () => {
    throw new Error('node specific operation was called');
  };
  return {
    [Symbol.toPrimitive]: () => timerId,
    [Symbol.dispose]: throwErrorForNodeOperation, // Cancels the timeout in node
    hasRef: throwErrorForNodeOperation,
    close: throwErrorForNodeOperation,
    _onTimeout: throwErrorForNodeOperation,
    refresh: throwErrorForNodeOperation,
    ref: throwErrorForNodeOperation,
    unref: throwErrorForNodeOperation,
  };
}
