import { ISanityCheckOptions } from './ISanityCheckOptions';

export interface ISanityValidator {
  shouldValidate(options: ISanityCheckOptions): boolean;
  collectErrors(): Iterable<string>;
}
