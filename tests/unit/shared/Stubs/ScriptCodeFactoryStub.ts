import type { ScriptCodeFactory } from '@/domain/ScriptCodeFactory';
import type { IScriptCode } from '@/domain/IScriptCode';
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
  readonly scriptCode?: IScriptCode;
  readonly defaultCodePrefix?: string;
}
