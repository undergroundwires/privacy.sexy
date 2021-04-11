import 'mocha';
import { expect } from 'chai';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/ScriptingLanguageFactory';
import { ScriptingLanguageFactoryTestRunner } from './ScriptingLanguageFactoryTestRunner';
import { EnumRangeTestRunner } from '../EnumRangeTestRunner';

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
            const getter = () => undefined;
            const sut = new ScriptingLanguageConcrete();
            // act
            const act = (language: ScriptingLanguage) => sut.registerGetter(language, getter);
            // assert
            new EnumRangeTestRunner(act)
                .testOutOfRangeThrows()
                .testUndefinedValueThrows()
                .testValidValueDoesNotThrow(validValue);
        });
        it('throw when getter is undefined', () => {
            // arrange
            const expectedError = `undefined getter`;
            const language = ScriptingLanguage.batchfile;
            const getter = undefined;
            const sut = new ScriptingLanguageConcrete();
            // act
            const act = () => sut.registerGetter(language, getter);
            // assert
            expect(act).to.throw(expectedError);
        });
        it('throw when language is already registered', () => {
            // arrange
            const language = ScriptingLanguage.batchfile;
            const expectedError = `${ScriptingLanguage[language]} is already registered`;
            const getter = () => undefined;
            const sut = new ScriptingLanguageConcrete();
            // act
            sut.registerGetter(language, getter);
            const reRegister = () => sut.registerGetter(language, getter);
            // assert
            expect(reRegister).to.throw(expectedError);
        });
    });
    describe('create', () => {
        const sut = new ScriptingLanguageConcrete();
        sut.registerGetter(ScriptingLanguage.batchfile, () => undefined);
        const runner = new ScriptingLanguageFactoryTestRunner();
        runner.testCreateMethod(sut);
    });
});

