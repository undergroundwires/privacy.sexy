import 'mocha';
import { expect } from 'chai';
import { Script } from '@/domain/Script';

describe('Script', () => {

    it('cannot construct with duplicate lines', () => {
        // arrange
        const code = 'duplicate\nduplicate\ntest\nduplicate';

        // act
        function construct() { return new Script('ScriptName', code, [], true); }

        // assert
        expect(construct).to.throw();
    });
});
