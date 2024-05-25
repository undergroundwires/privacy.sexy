import type { ScriptFactory } from '@/application/Parser/Script/ScriptParser';
import type { IScript } from '@/domain/IScript';
import type { ScriptInitParameters } from '@/domain/Script';
import { ScriptStub } from './ScriptStub';

export function createScriptFactorySpy(): {
  readonly scriptFactorySpy: ScriptFactory;
  getInitParameters: (category: IScript) => ScriptInitParameters | undefined;
} {
  const createdScripts = new Map<IScript, ScriptInitParameters>();
  return {
    scriptFactorySpy: (parameters) => {
      const script = new ScriptStub('script from factory stub');
      createdScripts.set(script, parameters);
      return script;
    },
    getInitParameters: (script) => createdScripts.get(script),
  };
}
