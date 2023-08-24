import { ISanityCheckOptions } from '@/infrastructure/RuntimeSanity/ISanityCheckOptions';
import { ISanityValidator } from '@/infrastructure/RuntimeSanity/ISanityValidator';

export class SanityValidatorStub implements ISanityValidator {
  public shouldValidateArgs = new Array<ISanityCheckOptions>();

  private errors: readonly string[] = [];

  private shouldValidateResult = true;

  public shouldValidate(options: ISanityCheckOptions): boolean {
    this.shouldValidateArgs.push(options);
    return this.shouldValidateResult;
  }

  public collectErrors(): Iterable<string> {
    return this.errors;
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
