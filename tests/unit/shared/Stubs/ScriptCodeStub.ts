import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';

export class ScriptCodeStub implements ScriptCode {
  public execute = `[${ScriptCodeStub.name}] default execute code`;

  public revert = `[${ScriptCodeStub.name}] default revert code`;

  public withExecute(code: string) {
    this.execute = code;
    return this;
  }

  public withRevert(revert: string) {
    this.revert = revert;
    return this;
  }
}
