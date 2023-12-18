import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';

export function useCodeRunner(
  window: WindowVariables = globalThis.window,
) {
  return {
    codeRunner: window.codeRunner,
  };
}
