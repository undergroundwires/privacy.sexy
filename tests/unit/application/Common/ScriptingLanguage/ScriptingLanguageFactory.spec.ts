import { describe, it, expect } from 'vitest';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { ScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/ScriptingLanguageFactory';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';
import { ScriptingLanguageFactoryTestRunner } from './ScriptingLanguageFactoryTestRunner';

class ScriptingLanguageConcrete extends ScriptingLanguageFactory<number> {
  public registerGetter(language: ScriptLanguage, getter: () => number) {
    super.registerGetter(language, getter);
  }
}

describe('ScriptingLanguageFactory', () => {
  describe('registerGetter', () => {
    describe('validates language', () => {
      // arrange
      const validValue = ScriptLanguage.batchfile;
      const getter = () => 1;
      const sut = new ScriptingLanguageConcrete();
      // act
      const act = (language: ScriptLanguage) => sut.registerGetter(language, getter);
      // assert
      new EnumRangeTestRunner(act)
        .testOutOfRangeThrows()
        .testValidValueDoesNotThrow(validValue);
    });
    it('throw when language is already registered', () => {
      // arrange
      const language = ScriptLanguage.batchfile;
      const expectedError = `${ScriptLanguage[language]} is already registered`;
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
    sut.registerGetter(ScriptLanguage.batchfile, () => ScriptLanguage.batchfile);
    sut.registerGetter(ScriptLanguage.shellscript, () => ScriptLanguage.shellscript);
    // assert
    runner
      .expectValue(ScriptLanguage.shellscript, ScriptLanguage.shellscript)
      .expectValue(ScriptLanguage.batchfile, ScriptLanguage.batchfile)
      .testCreateMethod(sut);
  });
});
