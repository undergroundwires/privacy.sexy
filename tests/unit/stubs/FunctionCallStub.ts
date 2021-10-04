import { IFunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/IFunctionCall';
import { FunctionCallArgumentCollectionStub } from './FunctionCallArgumentCollectionStub';

export class FunctionCallStub implements IFunctionCall {
    public functionName = 'functionCallStub';
    public args = new FunctionCallArgumentCollectionStub();

    public withFunctionName(functionName: string) {
        this.functionName = functionName;
        return this;
    }
    public withArgument(parameterName: string, argumentValue: string) {
        this.args.withArgument(parameterName, argumentValue);
        return this;
    }
    public withArguments(args: { readonly [index: string]: string }) {
        this.args.withArguments(args);
        return this;
    }
    public withArgumentCollection(args: FunctionCallArgumentCollectionStub) {
        this.args = args;
        return this;
    }
}
