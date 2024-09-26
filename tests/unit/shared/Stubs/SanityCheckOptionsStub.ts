import type { SanityCheckOptions } from '@/infrastructure/RuntimeSanity/Common/SanityCheckOptions';

export class SanityCheckOptionsStub implements SanityCheckOptions {
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
