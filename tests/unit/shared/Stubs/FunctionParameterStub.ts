import type { FunctionParameter } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/FunctionParameter';

export class FunctionParameterStub implements FunctionParameter {
  public name = 'function-parameter-stub';

  public isOptional = true;

  public withName(name: string) {
    this.name = name;
    return this;
  }

  public withOptional(isOptional: boolean) {
    this.isOptional = isOptional;
    return this;
  }
}
