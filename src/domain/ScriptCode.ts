import { IScriptCode } from './IScriptCode';

export class ScriptCode implements IScriptCode {
  constructor(
    public readonly execute: string,
    public readonly revert: string | undefined,
  ) {
    validateCode(execute);
    validateRevertCode(revert, execute);
  }
}

function validateRevertCode(revertCode: string | undefined, execute: string) {
  if (!revertCode) {
    return;
  }
  try {
    validateCode(revertCode);
    if (execute === revertCode) {
      throw new Error('Code itself and its reverting code cannot be the same');
    }
  } catch (err) {
    throw Error(`(revert): ${err.message}`);
  }
}

function validateCode(code: string): void {
  if (code.length === 0) {
    throw new Error('missing code');
  }
}
