import { FunctionData, ScriptFunctionCallData } from 'js-yaml-loader!*';

export class FunctionDataStub implements FunctionData {
    public static createWithCode() {
        return new FunctionDataStub()
            .withCode('stub-code')
            .withRevertCode('stub-revert-code');
    }
    public static createWithCall(call?: ScriptFunctionCallData) {
        let instance = new FunctionDataStub();
        if (call) {
            instance = instance.withCall(call);
        } else {
            instance = instance.withMockCall();
        }
        return instance;
    }
    public static createWithoutCallOrCodes() {
        return new FunctionDataStub();
    }

    public name = 'function data stub';
    public code: string;
    public revertCode: string;
    public parameters?: readonly string[];
    public call?: ScriptFunctionCallData;

    private constructor() { }

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
    public withCall(call: ScriptFunctionCallData) {
        this.call = call;
        return this;
    }
    public withMockCall() {
        this.call = { function: 'func' };
        return this;
    }
}
