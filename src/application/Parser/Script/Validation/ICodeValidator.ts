import { ICodeValidationRule } from './ICodeValidationRule';

export interface ICodeValidator {
  throwIfInvalid(
    code: string,
    rules: readonly ICodeValidationRule[],
  ): void;
}
