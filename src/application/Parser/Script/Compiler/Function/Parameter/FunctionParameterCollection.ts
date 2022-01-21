import { IFunctionParameterCollection } from './IFunctionParameterCollection';
import { IFunctionParameter } from './IFunctionParameter';

export class FunctionParameterCollection implements IFunctionParameterCollection {
  private parameters = new Array<IFunctionParameter>();

  public get all(): readonly IFunctionParameter[] {
    return this.parameters;
  }

  public addParameter(parameter: IFunctionParameter) {
    this.ensureValidParameter(parameter);
    this.parameters.push(parameter);
  }

  private includesName(name: string) {
    return this.parameters.find((existingParameter) => existingParameter.name === name);
  }

  private ensureValidParameter(parameter: IFunctionParameter) {
    if (!parameter) {
      throw new Error('missing parameter');
    }
    if (this.includesName(parameter.name)) {
      throw new Error(`duplicate parameter name: "${parameter.name}"`);
    }
  }
}
