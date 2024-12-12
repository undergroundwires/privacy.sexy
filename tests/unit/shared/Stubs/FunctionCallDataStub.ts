import type { FunctionCallData, FunctionCallParametersData } from '@/application/collections/';

export class FunctionCallDataStub implements FunctionCallData {
  public function = `[${FunctionCallDataStub.name}]callee-function`;

  public parameters: { [index: string]: string } = { testParameter: 'testArgument' };

  public withName(functionName: string) {
    this.function = functionName;
    return this;
  }

  public withParameters(parameters: FunctionCallParametersData) {
    this.parameters = parameters;
    return this;
  }
}
