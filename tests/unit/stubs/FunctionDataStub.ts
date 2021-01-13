import { FunctionData } from 'js-yaml-loader!*';

export class FunctionDataStub implements FunctionData {
    public name = 'function data stub';
    public code = 'function data stub code';
    public revertCode = 'function data stub revertCode';
    public parameters?: readonly string[];

    public withName(name: string) {
        this.name = name;
        return this;
    }
    public withParameters(...parameters: string[]) {
        this.parameters = parameters;
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
}
