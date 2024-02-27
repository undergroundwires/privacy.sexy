import type { ISanityCheckOptions } from '@/infrastructure/RuntimeSanity/Common/ISanityCheckOptions';

export class SanityCheckOptionsStub implements ISanityCheckOptions {
  public validateWindowVariables = false;

  public validateEnvironmentVariables = false;

  public withvalidateEnvironmentVariables(value: boolean): this {
    this.validateEnvironmentVariables = value;
    return this;
  }

  public withValidateEnvironment(value: boolean): this {
    this.validateWindowVariables = value;
    return this;
  }
}
