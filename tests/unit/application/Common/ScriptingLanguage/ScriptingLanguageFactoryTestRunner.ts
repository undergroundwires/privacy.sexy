import { describe, it, expect } from 'vitest';
import type { IScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/IScriptingLanguageFactory';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';

type Constructible<T = object> = new (...args: unknown[]) => T;

export class ScriptingLanguageFactoryTestRunner<T> {
  private expectedLanguageTypes = new Map<ScriptLanguage, Constructible<T>>();

  private expectedValues = new Map<ScriptLanguage, T>();

  public expectInstance(language: ScriptLanguage, resultType: Constructible<T>) {
    this.expectedLanguageTypes.set(language, resultType);
    return this;
  }

  public expectValue(language: ScriptLanguage, resultType: T) {
    this.expectedValues.set(language, resultType);
    return this;
  }

  public testCreateMethod(sut: IScriptingLanguageFactory<T>) {
    testLanguageValidation(sut);
    if (this.expectedLanguageTypes.size) {
      testExpectedInstanceTypes(sut, this.expectedLanguageTypes);
    }
    if (this.expectedValues.size) {
      testExpectedValues(sut, this.expectedValues);
    }
  }
}

function testExpectedInstanceTypes<T>(
  sut: IScriptingLanguageFactory<T>,
  expectedTypes: Map<ScriptLanguage, Constructible<T>>,
) {
  if (!expectedTypes.size) {
    throw new Error('No expected types provided.');
  }
  describe('`create` creates expected instances', () => {
    // arrange
    for (const language of expectedTypes.keys()) {
      it(ScriptLanguage[language], () => {
        // act
        const expected = expectedTypes.get(language);
        const result = sut.create(language);
        // assert
        expect(result).to.be.instanceOf(expected, `Actual was: ${result}`);
      });
    }
  });
}

function testExpectedValues<T>(
  sut: IScriptingLanguageFactory<T>,
  expectedValues: Map<ScriptLanguage, T>,
) {
  if (!expectedValues.size) {
    throw new Error('No expected values provided.');
  }
  describe('`create` creates expected values', () => {
    // arrange
    for (const language of expectedValues.keys()) {
      it(ScriptLanguage[language], () => {
        // act
        const expected = expectedValues.get(language);
        const result = sut.create(language);
        // assert
        expect(result).to.equal(expected);
      });
    }
  });
}

function testLanguageValidation<T>(sut: IScriptingLanguageFactory<T>) {
  describe('`create` validates language selection', () => {
    // arrange
    const validValue = ScriptLanguage.batchfile;
    // act
    const act = (value: ScriptLanguage) => sut.create(value);
    // assert
    new EnumRangeTestRunner(act)
      .testOutOfRangeThrows()
      .testValidValueDoesNotThrow(validValue);
  });
}
