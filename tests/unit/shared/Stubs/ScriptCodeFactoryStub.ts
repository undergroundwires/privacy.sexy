import type { ScriptCodeFactory } from '@/domain/Executables/Script/Code/ScriptCodeFactory';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import { ScriptCodeStub } from './ScriptCodeStub';

export function createScriptCodeFactoryStub(
  options?: Partial<StubOptions>,
): ScriptCodeFactory {
  let defaultCodePrefix = 'createScriptCodeFactoryStub';
  if (options?.defaultCodePrefix) {
    defaultCodePrefix += ` > ${options?.defaultCodePrefix}`;
  }
  return (
    () => options?.scriptCode ?? new ScriptCodeStub()
      .withExecute(`[${defaultCodePrefix}] default code`)
      .withRevert(`[${defaultCodePrefix}] revert code`)
  );
}

interface StubOptions {
  readonly scriptCode?: ScriptCode;
  readonly defaultCodePrefix?: string;
}
