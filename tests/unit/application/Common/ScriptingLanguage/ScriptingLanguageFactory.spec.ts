import { describe, it, expect } from 'vitest';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/ScriptingLanguageFactory';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';
import { ScriptingLanguageFactoryTestRunner } from './ScriptingLanguageFactoryTestRunner';

class ScriptingLanguageConcrete extends ScriptingLanguageFactory<number> {
  public registerGetter(language: ScriptingLanguage, getter: () => number) {
    super.registerGetter(language, getter);
  }
}

describe('ScriptingLanguageFactory', () => {
  describe('registerGetter', () => {
    describe('validates language', () => {
      // arrange
      const validValue = ScriptingLanguage.batchfile;
      const getter = () => 1;
      const sut = new ScriptingLanguageConcrete();
      // act
      const act = (language: ScriptingLanguage) => sut.registerGetter(language, getter);
      // assert
      new EnumRangeTestRunner(act)
        .testOutOfRangeThrows()
        .testValidValueDoesNotThrow(validValue);
    });
    it('throw when language is already registered', () => {
      // arrange
      const language = ScriptingLanguage.batchfile;
      const expectedError = `${ScriptingLanguage[language]} is already registered`;
      const getter = () => 1;
      const sut = new ScriptingLanguageConcrete();
      // act
      sut.registerGetter(language, getter);
      const reRegister = () => sut.registerGetter(language, getter);
      // assert
      expect(reRegister).to.throw(expectedError);
    });
  });
  describe('create', () => {
    // arrange
    const sut = new ScriptingLanguageConcrete();
    const runner = new ScriptingLanguageFactoryTestRunner();
    // act
    sut.registerGetter(ScriptingLanguage.batchfile, () => ScriptingLanguage.batchfile);
    sut.registerGetter(ScriptingLanguage.shellscript, () => ScriptingLanguage.shellscript);
    // assert
    runner
      .expectValue(ScriptingLanguage.shellscript, ScriptingLanguage.shellscript)
      .expectValue(ScriptingLanguage.batchfile, ScriptingLanguage.batchfile)
      .testCreateMethod(sut);
  });
});
