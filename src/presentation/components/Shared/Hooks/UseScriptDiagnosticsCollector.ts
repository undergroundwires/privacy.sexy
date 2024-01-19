import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';

export function useScriptDiagnosticsCollector(
  window: Partial<WindowVariables> = globalThis.window,
) {
  return {
    scriptDiagnosticsCollector: window?.scriptDiagnosticsCollector,
  };
}
