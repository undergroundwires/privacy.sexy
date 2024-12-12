import type { ParameterDefinitionData } from '@/application/collections/';

export class ParameterDefinitionDataStub implements ParameterDefinitionData {
  public name: string = `[${ParameterDefinitionDataStub.name}]name`;

  public optional?: boolean;

  public withName(name: string) {
    this.name = name;
    return this;
  }

  public withOptionality(isOptional: boolean) {
    this.optional = isOptional;
    return this;
  }
}
