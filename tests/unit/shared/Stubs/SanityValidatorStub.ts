import { ISanityCheckOptions } from '@/infrastructure/RuntimeSanity/Common/ISanityCheckOptions';
import { ISanityValidator } from '@/infrastructure/RuntimeSanity/Common/ISanityValidator';

export class SanityValidatorStub implements ISanityValidator {
  public shouldValidateArgs = new Array<ISanityCheckOptions>();

  public name = 'sanity-validator-stub';

  private errors: readonly string[] = [];

  private shouldValidateResult = true;

  public shouldValidate(options: ISanityCheckOptions): boolean {
    this.shouldValidateArgs.push(options);
    return this.shouldValidateResult;
  }

  public collectErrors(): Iterable<string> {
    return this.errors;
  }

  public withName(name: string): this {
    this.name = name;
    return this;
  }

  public withErrorsResult(errors: readonly string[]): this {
    this.errors = errors;
    return this;
  }

  public withShouldValidateResult(shouldValidate: boolean): this {
    this.shouldValidateResult = shouldValidate;
    return this;
  }
}
