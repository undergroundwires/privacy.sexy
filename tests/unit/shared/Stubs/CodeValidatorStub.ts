import { expect } from 'vitest';
import type { Constructible } from '@/TypeHelpers';
import type { ICodeValidationRule } from '@/application/Parser/Script/Validation/ICodeValidationRule';
import type { ICodeValidator } from '@/application/Parser/Script/Validation/ICodeValidator';

export class CodeValidatorStub implements ICodeValidator {
  public callHistory = new Array<{
    code: string,
    rules: readonly ICodeValidationRule[],
  }>();

  public throwIfInvalid(
    code: string,
    rules: readonly ICodeValidationRule[],
  ): void {
    this.callHistory.push({
      code,
      rules: Array.from(rules),
    });
  }

  public assertHistory(expected: {
    validatedCodes: readonly (string | undefined)[],
    rules: readonly Constructible<ICodeValidationRule>[],
  }) {
    expect(this.callHistory).to.have.lengthOf(expected.validatedCodes.length);
    const actualValidatedCodes = this.callHistory.map((args) => args.code);
    expect(actualValidatedCodes.sort()).deep.equal([...expected.validatedCodes].sort());
    for (const call of this.callHistory) {
      const actualRules = call.rules.map((rule) => rule.constructor);
      expect(actualRules.sort()).to.deep.equal([...expected.rules].sort());
    }
  }
}
