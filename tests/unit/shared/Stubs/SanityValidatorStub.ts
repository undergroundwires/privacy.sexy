import type { SanityCheckOptions } from '@/infrastructure/RuntimeSanity/Common/SanityCheckOptions';
import type { SanityValidator } from '@/infrastructure/RuntimeSanity/Common/SanityValidator';

export class SanityValidatorStub implements SanityValidator {
  public shouldValidateArgs = new Array<SanityCheckOptions>();

  public name = 'sanity-validator-stub';

  private errors: readonly string[] = [];

  private shouldValidateResult = true;

  public shouldValidate(options: SanityCheckOptions): boolean {
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
