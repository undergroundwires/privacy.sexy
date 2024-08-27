import { expect } from 'vitest';
import type { CodeValidator } from '@/application/Parser/Executable/Script/Validation/CodeValidator';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import type { CodeValidationRule } from '@/application/Parser/Executable/Script/Validation/CodeValidationRule';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

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
    language: ScriptingLanguage,
  ) {
    expectExpectedLanguage(this, language);
  }
}

function expectExpectedCodes(
  validator: CodeValidatorStub,
  expectedCodes: readonly string[],
): void {
  expect(validator.callHistory).to.have.lengthOf(expectedCodes.length, formatAssertionMessage([
    'Mismatch in number of validated codes',
    `Expected: ${expectedCodes.length}`,
    `Actual: ${validator.callHistory.length}`,
  ]));
  const actualValidatedCodes = validator.callHistory.map((args) => {
    const [code] = args;
    return code;
  });
  expect(actualValidatedCodes).to.have.members(expectedCodes, formatAssertionMessage([
    'Mismatch in validated codes',
    `Expected: ${JSON.stringify(expectedCodes)}`,
    `Actual: ${JSON.stringify(actualValidatedCodes)}`,
  ]));
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
    expect(actualRules).to.have.members(expectedRules, formatAssertionMessage([
      'Mismatch in validation rules for for a call.',
      `Expected: ${JSON.stringify(expectedRules)}`,
      `Actual: ${JSON.stringify(actualRules)}`,
    ]));
  }
}

function expectExpectedLanguage(
  validator: CodeValidatorStub,
  expectedLanguage: ScriptingLanguage,
): void {
  for (const call of validator.callHistory) {
    const [,language] = call;
    expect(language).to.equal(expectedLanguage, formatAssertionMessage([
      'Mismatch in scripting language',
      `Expected: ${ScriptingLanguage[expectedLanguage]}`,
      `Actual: ${ScriptingLanguage[language]}`,
    ]));
  }
}
