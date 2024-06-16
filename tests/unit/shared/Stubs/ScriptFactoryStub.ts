import type { Script } from '@/domain/Executables/Script/Script';
import type { ScriptFactory, ScriptInitParameters } from '@/domain/Executables/Script/ScriptFactory';
import { ScriptStub } from './ScriptStub';

export function createScriptFactorySpy(): {
  readonly scriptFactorySpy: ScriptFactory;
  getInitParameters: (category: Script) => ScriptInitParameters | undefined;
} {
  const createdScripts = new Map<Script, ScriptInitParameters>();
  return {
    scriptFactorySpy: (parameters) => {
      const script = new ScriptStub('script from factory stub');
      createdScripts.set(script, parameters);
      return script;
    },
    getInitParameters: (script) => createdScripts.get(script),
  };
}
