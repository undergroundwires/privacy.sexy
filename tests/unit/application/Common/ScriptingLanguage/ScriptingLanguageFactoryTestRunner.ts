import 'mocha';
import { expect } from 'chai';
import { IScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/IScriptingLanguageFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';

export class ScriptingLanguageFactoryTestRunner<T> {
    private expectedTypes = new Map<ScriptingLanguage, T>();
    public expect(language: ScriptingLanguage, resultType: T) {
        this.expectedTypes.set(language, resultType);
        return this;
    }
    public testCreateMethod(sut: IScriptingLanguageFactory<T>) {
        if (!sut) { throw new Error('undefined sut'); }
        testLanguageValidation(sut);
        testExpectedInstanceTypes(sut, this.expectedTypes);
    }
}

function testExpectedInstanceTypes<T>(
    sut: IScriptingLanguageFactory<T>,
    expectedTypes: Map<ScriptingLanguage, T>) {
    describe('create returns expected instances', () => {
        // arrange
        for (const language of Array.from(expectedTypes.keys())) {
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

function testLanguageValidation<T>(sut: IScriptingLanguageFactory<T>) {
    describe('validates language', () => {
        // arrange
        const validValue = ScriptingLanguage.batchfile;
        // act
        const act = (value: ScriptingLanguage) => sut.create(value);
        // assert
        new EnumRangeTestRunner(act)
            .testOutOfRangeThrows()
            .testUndefinedValueThrows()
            .testValidValueDoesNotThrow(validValue);
    });
}
