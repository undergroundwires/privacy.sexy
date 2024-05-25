import type { IFunctionParameter } from '@/application/Parser/Script/Compiler/Function/Parameter/IFunctionParameter';
import type { IFunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import { FunctionParameterStub } from './FunctionParameterStub';

export class FunctionParameterCollectionStub implements IFunctionParameterCollection {
  private parameters = new Array<IFunctionParameter>();

  public addParameter(parameter: IFunctionParameter): void {
    this.parameters.push(parameter);
  }

  public get all(): readonly IFunctionParameter[] {
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
