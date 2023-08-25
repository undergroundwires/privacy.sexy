import { ISanityCheckOptions } from '@/infrastructure/RuntimeSanity/Common/ISanityCheckOptions';

export class SanityCheckOptionsStub implements ISanityCheckOptions {
  public validateEnvironment = false;

  public validateMetadata = false;

  public withValidateMetadata(value: boolean): this {
    this.validateMetadata = value;
    return this;
  }

  public withValidateEnvironment(value: boolean): this {
    this.validateEnvironment = value;
    return this;
  }
}
