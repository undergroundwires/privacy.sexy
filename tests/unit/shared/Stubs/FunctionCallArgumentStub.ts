import type { FunctionCallArgument } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Argument/FunctionCallArgument';

export class FunctionCallArgumentStub implements FunctionCallArgument {
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
