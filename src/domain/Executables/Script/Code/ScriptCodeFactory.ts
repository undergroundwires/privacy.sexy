import { DistinctReversibleScriptCode } from './DistinctReversibleScriptCode';
import type { ScriptCode } from './ScriptCode';

export interface ScriptCodeFactory {
  (
    ...args: ConstructorParameters<typeof DistinctReversibleScriptCode>
  ): ScriptCode;
}

export const createScriptCode: ScriptCodeFactory = (
  ...args
) => new DistinctReversibleScriptCode(...args);
