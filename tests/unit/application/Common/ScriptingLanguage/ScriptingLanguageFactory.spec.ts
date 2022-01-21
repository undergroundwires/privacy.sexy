import 'mocha';
import { expect } from 'chai';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/ScriptingLanguageFactory';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';
import { itEachAbsentObjectValue } from '@tests/unit/common/AbsentTests';
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
        .testAbsentValueThrows()
        .testValidValueDoesNotThrow(validValue);
    });
    describe('describe when getter is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing getter';
        const language = ScriptingLanguage.batchfile;
        const getter = absentValue;
        const sut = new ScriptingLanguageConcrete();
        // act
        const act = () => sut.registerGetter(language, getter);
        // assert
        expect(act).to.throw(expectedError);
      });
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
    sut.registerGetter(ScriptingLanguage.batchfile, () => 1);
    // assert
    runner.testCreateMethod(sut);
  });
});
