import { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';
import { AppMetadataStub } from './AppMetadataStub';

export class EnvironmentVariablesStub extends AppMetadataStub implements IEnvironmentVariables {
  public isNonProduction = true;

  public withIsNonProduction(isNonProduction: boolean): this {
    this.isNonProduction = isNonProduction;
    return this;
  }
}
