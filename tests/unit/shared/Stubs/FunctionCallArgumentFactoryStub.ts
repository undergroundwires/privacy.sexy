import type { FunctionCallArgumentFactory } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Argument/FunctionCallArgument';
import { FunctionCallArgumentStub } from './FunctionCallArgumentStub';

export class FunctionCallArgumentFactoryStub {
  public factory: FunctionCallArgumentFactory = (parameterName, argumentValue) => {
    return new FunctionCallArgumentStub()
      .withParameterName(parameterName)
      .withArgumentValue(argumentValue);
  };
}
