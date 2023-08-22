import { describe, it, expect } from 'vitest';
import { IScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/IScriptingLanguageFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';

type Constructible<T = object> = new (...args: unknown[]) => T;

export class ScriptingLanguageFactoryTestRunner<T> {
  private expectedLanguageTypes = new Map<ScriptingLanguage, Constructible<T>>();

  private expectedValues = new Map<ScriptingLanguage, T>();

  public expectInstance(language: ScriptingLanguage, resultType: Constructible<T>) {
    this.expectedLanguageTypes.set(language, resultType);
    return this;
  }

  public expectValue(language: ScriptingLanguage, resultType: T) {
    this.expectedValues.set(language, resultType);
    return this;
  }

  public testCreateMethod(sut: IScriptingLanguageFactory<T>) {
    if (!sut) { throw new Error('missing sut'); }
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
  expectedTypes: Map<ScriptingLanguage, Constructible<T>>,
) {
  if (!expectedTypes?.size) {
    throw new Error('No expected types provided.');
  }
  describe('`create` creates expected instances', () => {
    // arrange
    for (const language of expectedTypes.keys()) {
      it(ScriptingLanguage[language], () => {
        // act
        const expected = expectedTypes.get(language);
        const result = sut.create(language);
        // assert
        expect(result).to.be.instanceOf(expected, `Actual was: ${result.constructor.name}`);
      });
    }
  });
}

function testExpectedValues<T>(
  sut: IScriptingLanguageFactory<T>,
  expectedValues: Map<ScriptingLanguage, T>,
) {
  if (!expectedValues?.size) {
    throw new Error('No expected values provided.');
  }
  describe('`create` creates expected values', () => {
    // arrange
    for (const language of expectedValues.keys()) {
      it(ScriptingLanguage[language], () => {
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
    const validValue = ScriptingLanguage.batchfile;
    // act
    const act = (value: ScriptingLanguage) => sut.create(value);
    // assert
    new EnumRangeTestRunner(act)
      .testOutOfRangeThrows()
      .testAbsentValueThrows()
      .testValidValueDoesNotThrow(validValue);
  });
}
