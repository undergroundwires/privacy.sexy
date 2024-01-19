// Allows aligning with both NodeJs (NodeJs.Timeout) and Window type (number)
export type TimeoutType = ReturnType<typeof setTimeout>;

export interface Timer {
  setTimeout: (callback: () => void, ms: number) => TimeoutType;
  clearTimeout: (timeoutId: TimeoutType) => void;
  dateNow(): number;
}
