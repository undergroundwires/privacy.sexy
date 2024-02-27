import type { IFunctionCallArgument } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgument';

export class FunctionCallArgumentStub implements IFunctionCallArgument {
  public parameterName = 'stub-parameter-name';

  public argumentValue = 'stub-arg-name';

  public withParameterName(parameterName: string) {
    this.parameterName = parameterName;
    return this;
  }

  public withArgumentValue(argumentValue: string) {
    this.argumentValue = argumentValue;
    return this;
  }
}
