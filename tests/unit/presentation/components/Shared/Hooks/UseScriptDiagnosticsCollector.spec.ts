import { describe, it, expect } from 'vitest';
import { useScriptDiagnosticsCollector } from '@/presentation/components/Shared/Hooks/UseScriptDiagnosticsCollector';
import { ScriptDiagnosticsCollectorStub } from '@tests/unit/shared/Stubs/ScriptDiagnosticsCollectorStub';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';

describe('useScriptDiagnosticsCollector', () => {
  it('returns undefined if collector is not present on the window object', () => {
    // arrange
    const emptyWindow = {} as WindowVariables;
    // act
    const { scriptDiagnosticsCollector } = useScriptDiagnosticsCollector(emptyWindow);
    // assert
    expect(scriptDiagnosticsCollector).to.equal(undefined);
  });

  it('returns the scriptDiagnosticsCollector when it is present on the window object', () => {
    // arrange
    const expectedCollector = new ScriptDiagnosticsCollectorStub();
    const windowWithVariable: Partial<WindowVariables> = {
      scriptDiagnosticsCollector: expectedCollector,
    } as Partial<WindowVariables>;
    // act
    const { scriptDiagnosticsCollector } = useScriptDiagnosticsCollector(windowWithVariable);
    // assert
    expect(scriptDiagnosticsCollector).to.equal(expectedCollector);
  });
});
