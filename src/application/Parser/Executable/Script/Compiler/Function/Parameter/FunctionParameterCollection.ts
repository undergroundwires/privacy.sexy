import type { IFunctionParameterCollection } from './IFunctionParameterCollection';
import type { FunctionParameter } from './FunctionParameter';

export class FunctionParameterCollection implements IFunctionParameterCollection {
  private parameters = new Array<FunctionParameter>();

  public get all(): readonly FunctionParameter[] {
    return this.parameters;
  }

  public addParameter(parameter: FunctionParameter) {
    this.ensureValidParameter(parameter);
    this.parameters.push(parameter);
  }

  private includesName(name: string) {
    return this.parameters.find((existingParameter) => existingParameter.name === name);
  }

  private ensureValidParameter(parameter: FunctionParameter) {
    if (this.includesName(parameter.name)) {
      throw new Error(`duplicate parameter name: "${parameter.name}"`);
    }
  }
}
