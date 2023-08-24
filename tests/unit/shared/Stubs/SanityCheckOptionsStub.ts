import { ISanityCheckOptions } from '@/infrastructure/RuntimeSanity/ISanityCheckOptions';

export class SanityCheckOptionsStub implements ISanityCheckOptions {
  public validateMetadata = false;

  public withValidateMetadata(value: boolean): this {
    this.validateMetadata = value;
    return this;
  }
}
