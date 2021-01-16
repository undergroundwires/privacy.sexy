import { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';

export class SharedFunctionStub implements ISharedFunction {
    public name = 'shared-function-stub-name';
    public parameters?: readonly string[] = [
        'shared-function-stub-parameter',
    ];
    public code = 'shared-function-stub-code';
    public revertCode = 'shared-function-stub-revert-code';

    public withName(name: string) {
        this.name = name;
        return this;
    }
    public withCode(code: string) {
        this.code = code;
        return this;
    }
    public withRevertCode(revertCode: string) {
        this.revertCode = revertCode;
        return this;
    }
    public withParameters(...params: string[]) {
        this.parameters = params;
        return this;
    }
}
