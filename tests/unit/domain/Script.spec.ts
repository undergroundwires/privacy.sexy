import 'mocha';
import { expect } from 'chai';
import { Script } from '@/domain/Script';

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
    });
});

function createWithCode(code: string, revertCode?: string): Script {
    return new Script('name', code, revertCode, [], false);
}
