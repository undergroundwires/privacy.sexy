import { ScriptCode } from './ScriptCode';
import type { IScriptCode } from './IScriptCode';

export interface ScriptCodeFactory {
  (
    ...args: ConstructorParameters<typeof ScriptCode>
  ): IScriptCode;
}

export const createScriptCode: ScriptCodeFactory = (...args) => new ScriptCode(...args);
