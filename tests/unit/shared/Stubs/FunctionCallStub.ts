import type { FunctionCall } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/FunctionCall';
import { FunctionCallArgumentCollectionStub } from './FunctionCallArgumentCollectionStub';

export class FunctionCallStub implements FunctionCall {
  public functionName = `[${FunctionCallStub.name}]name`;

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
