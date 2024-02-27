import type { ISanityCheckOptions } from './ISanityCheckOptions';

export interface ISanityValidator {
  readonly name: string;
  shouldValidate(options: ISanityCheckOptions): boolean;
  collectErrors(): Iterable<string>;
}
