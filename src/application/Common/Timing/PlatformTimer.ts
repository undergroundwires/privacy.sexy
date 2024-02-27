import type { Timer } from './Timer';

export const PlatformTimer: Timer = {
  setTimeout: (callback, ms) => setTimeout(callback, ms),
  clearTimeout: (timeoutId) => clearTimeout(timeoutId),
  dateNow: () => Date.now(),
};
