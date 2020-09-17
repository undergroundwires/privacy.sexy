import 'mocha';
import { expect } from 'chai';
import { ScriptCode } from '@/domain/ScriptCode';

describe('ScriptCode', () => {
    describe('scriptName', () => {
        it('throws if undefined', () => {
            // arrange
            const expectedError = 'name is undefined';
            const name = undefined;
            // act
            const act = () => new ScriptCode(name, 'non-empty-code', '');
            // assert
            expect(act).to.throw(expectedError);
        });
    });
    describe('code', () => {
        it('cannot construct with duplicate lines', () => {
            // arrange
            const code = 'duplicate\nduplicate\ntest\nduplicate';
            // act
            const act = () => createSut(code);
            // assert
            expect(act).to.throw();
        });
        it('cannot construct with empty lines', () => {
            // arrange
            const code = 'line1\n\n\nline2';
            // act
            const act = () => createSut(code);
            // assert
            expect(act).to.throw();
        });
        it('cannot construct with empty or undefined values', () => {
            // arrange
            const name = 'test-code';
            const errorMessage = `code of ${name} is empty or undefined`;
            const invalidValues = [ '', undefined ];
            invalidValues.forEach((invalidValue) => {
                // act
                const act = () => new ScriptCode(name, invalidValue, '');
                // assert
                expect(act).to.throw(errorMessage);
            });
        });
        it('sets as expected', () => {
            // arrange
            const expected = 'expected-revert';
            // act
            const sut = createSut(expected);
            // assert
            expect(sut.execute).to.equal(expected);
        });
    });
    describe('revert', () => {
        it('cannot construct with duplicate lines', () => {
            // arrange
            const code = 'duplicate\nduplicate\ntest\nduplicate';
            // act
            const act = () => createSut('REM', code);
            // assert
            expect(act).to.throw();
        });
        it('cannot construct with empty lines', () => {
            // arrange
            const code = 'line1\n\n\nline2';
            // act
            const act = () => createSut('REM', code);
            // assert
            expect(act).to.throw();
        });
        it('cannot construct with when same as code', () => {
            // arrange
            const code = 'REM';
            // act
            const act = () => createSut(code, code);
            // assert
            expect(act).to.throw();
        });
        it('sets as expected', () => {
            // arrange
            const expected = 'expected-revert';
            // act
            const sut = createSut('abc', expected);
            // assert
            expect(sut.revert).to.equal(expected);
        });
    });
});

function createSut(code: string, revert = ''): ScriptCode {
    return new ScriptCode('test-code', code, revert);
}
