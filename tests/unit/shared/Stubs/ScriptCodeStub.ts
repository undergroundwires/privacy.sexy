import { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';

export class ScriptCodeStub implements ScriptCode {
  public execute = 'default execute code';

  public revert: string | undefined = 'default revert code';

  public withExecute(code: string) {
    this.execute = code;
    return this;
  }

  public withRevert(revert: string | undefined) {
    this.revert = revert;
    return this;
  }
}
