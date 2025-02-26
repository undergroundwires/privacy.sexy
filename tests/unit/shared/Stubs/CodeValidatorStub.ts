import { expect } from 'vitest';
import type { CodeValidator } from '@/application/Parser/Executable/Script/Validation/CodeValidator';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import type { CodeValidationRule } from '@/application/Parser/Executable/Script/Validation/CodeValidationRule';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { expectArrayEquals } from '@tests/shared/Assertions/ExpectArrayEquals';

export class CodeValidatorStub {
  public callHistory = new Array<Parameters<CodeValidator>>();

  public get(): CodeValidator {
    return (...args) => {
      this.callHistory.push(args);
    };
  }

  public assertValidatedCodes(
    validatedCodes: readonly string[],
  ) {
    expectExpectedCodes(this, validatedCodes);
  }

  public assertValidatedRules(
    rules: readonly CodeValidationRule[],
  ) {
    expectExpectedRules(this, rules);
  }

  public assertValidatedLanguage(
    language: ScriptLanguage,
  ) {
    expectExpectedLanguage(this, language);
  }
}

function expectExpectedCodes(
  validator: CodeValidatorStub,
  expectedCodes: readonly string[],
): void {
  const actualValidatedCodes = validator.callHistory.map((args) => {
    const [code] = args;
    return code;
  });
  expectArrayEquals(actualValidatedCodes, expectedCodes);
}

function expectExpectedRules(
  validator: CodeValidatorStub,
  expectedRules: readonly CodeValidationRule[],
): void {
  for (const call of validator.callHistory) {
    const [,,actualRules] = call;
    expect(actualRules).to.have.lengthOf(expectedRules.length, formatAssertionMessage([
      'Mismatch in number of validation rules for a call.',
      `Expected: ${expectedRules.length}`,
      `Actual: ${actualRules.length}`,
    ]));
    expectArrayEquals(actualRules, expectedRules);
  }
}

function expectExpectedLanguage(
  validator: CodeValidatorStub,
  expectedLanguage: ScriptLanguage,
): void {
  for (const call of validator.callHistory) {
    const [,language] = call;
    expect(language).to.equal(expectedLanguage, formatAssertionMessage([
      'Mismatch in scripting language',
      `Expected: ${ScriptLanguage[expectedLanguage]}`,
      `Actual: ${ScriptLanguage[language]}`,
    ]));
  }
}
