import { IFunctionParameter } from '@/application/Parser/Script/Compiler/Function/Parameter/IFunctionParameter';

export class FunctionParameterStub implements IFunctionParameter {
  public name = 'function-parameter-stub';

  public isOptional = true;

  public withName(name: string) {
    this.name = name;
    return this;
  }

  public withOptionality(isOptional: boolean) {
    this.isOptional = isOptional;
    return this;
  }
}
