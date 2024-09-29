import type { SanityCheckOptions } from './SanityCheckOptions';

export interface SanityValidator {
  readonly name: string;
  shouldValidate(options: SanityCheckOptions): boolean;
  collectErrors(): Iterable<string>;
}
