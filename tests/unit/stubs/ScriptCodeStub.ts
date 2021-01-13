import { IScriptCode } from '@/domain/IScriptCode';

export class ScriptCodeStub implements IScriptCode {
    public execute = 'default execute code';
    public revert = 'default revert code';

    public withExecute(code: string) {
        this.execute = code;
        return this;
    }
    public withRevert(revert: string) {
        this.revert = revert;
        return this;
    }
}
