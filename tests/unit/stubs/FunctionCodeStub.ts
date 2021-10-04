import { IFunctionCode } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';

export class FunctionCodeStub implements IFunctionCode {
    public do: string = 'do code (function-code-stub)';
    public revert?: string = 'revert code (function-code-stub)';
    public withDo(code: string) {
        this.do = code;
        return this;
    }
    public withRevert(revert: string) {
        this.revert = revert;
        return this;
    }
}
