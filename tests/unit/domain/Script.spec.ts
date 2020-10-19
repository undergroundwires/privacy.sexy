import 'mocha';
import { expect } from 'chai';
import { Script } from '@/domain/Script';
import { RecommendationLevelNames, RecommendationLevel } from '@/domain/RecommendationLevel';

describe('Script', () => {
    describe('ctor', () => {
        describe('code', () => {
            it('cannot construct with duplicate lines', () => {
                const code = 'duplicate\nduplicate\ntest\nduplicate';
                expect(() => createWithCode(code)).to.throw();
            });
            it('cannot construct with empty lines', () => {
                const code = 'duplicate\n\n\ntest\nduplicate';
                expect(() => createWithCode(code)).to.throw();
            });
            it('sets as expected', () => {
                const expected = 'expected-revert';
                const sut = createWithCode(expected);
                expect(sut.code).to.equal(expected);
            });
        });
        describe('revertCode', () => {
            it('cannot construct with duplicate lines', () => {
                const code = 'duplicate\nduplicate\ntest\nduplicate';
                expect(() => createWithCode('REM', code)).to.throw();
            });
            it('cannot construct with empty lines', () => {
                const code = 'duplicate\n\n\ntest\nduplicate';
                expect(() => createWithCode('REM', code)).to.throw();
            });
            it('cannot construct with when same as code', () => {
                const code = 'REM';
                expect(() => createWithCode(code, code)).to.throw();
            });
            it('sets as expected', () => {
                const expected = 'expected-revert';
                const sut = createWithCode('abc', expected);
                expect(sut.revertCode).to.equal(expected);
            });
        });
        describe('canRevert', () => {
            it('returns false without revert code', () => {
                const sut = createWithCode('code');
                expect(sut.canRevert()).to.equal(false);
            });
            it('returns true with revert code', () => {
                const sut = createWithCode('code', 'non empty revert code');
                expect(sut.canRevert()).to.equal(true);
            });
        });
        describe('level', () => {
            it('cannot construct with invalid wrong value', () => {
                expect(() => createWithLevel(55)).to.throw('invalid level');
            });
            it('sets undefined as expected', () => {
                const sut = createWithLevel(undefined);
                expect(sut.level).to.equal(undefined);
            });
            it('sets as expected', () => {
                for (const expected of RecommendationLevelNames) {
                    const sut = createWithLevel(RecommendationLevel[expected]);
                    const actual = RecommendationLevel[sut.level];
                    expect(actual).to.equal(expected);
                }
            });
        });
    });
});

function createWithCode(code: string, revertCode?: string): Script {
    return new Script('name', code, revertCode, [], RecommendationLevel.Standard);
}
function createWithLevel(level: RecommendationLevel): Script {
    return new Script('name', 'code', 'revertCode', [], level);
}
