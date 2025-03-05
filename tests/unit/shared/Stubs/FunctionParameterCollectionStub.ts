import type { IFunctionParameterCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import type { FunctionParameter } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Parameter/FunctionParameter';
import { FunctionParameterStub } from './FunctionParameterStub';

export class FunctionParameterCollectionStub implements IFunctionParameterCollection {
  private parameters = new Array<FunctionParameter>();

  public addParameter(parameter: FunctionParameter): void {
    this.parameters.push(parameter);
  }

  public get all(): readonly FunctionParameter[] {
    return this.parameters;
  }

  public withParameterName(parameterName: string, isOptional = true) {
    const parameter = new FunctionParameterStub()
      .withName(parameterName)
      .withOptional(isOptional);
    this.addParameter(parameter);
    return this;
  }

  public withParameterNames(parameterNames: readonly string[], isOptional = true) {
    for (const parameterName of parameterNames) {
      this.withParameterName(parameterName, isOptional);
    }
    return this;
  }
}
