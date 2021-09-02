import { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { IReadOnlyFunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import { FunctionParameterCollectionStub } from './FunctionParameterCollectionStub';

export class SharedFunctionStub implements ISharedFunction {
    public name = 'shared-function-stub-name';
    public parameters: IReadOnlyFunctionParameterCollection = new FunctionParameterCollectionStub()
        .withParameterName('shared-function-stub-parameter-name');
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
    public withParameters(parameters: IReadOnlyFunctionParameterCollection) {
        this.parameters = parameters;
        return this;
    }
    public withParameterNames(...parameterNames: readonly string[]) {
        let collection = new FunctionParameterCollectionStub();
        for (const name of parameterNames) {
            collection = collection.withParameterName(name);
        }
        return this.withParameters(collection);
    }
}
