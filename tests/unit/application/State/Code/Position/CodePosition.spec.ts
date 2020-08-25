import { CodePosition } from '@/application/State/Code/Position/CodePosition';
import 'mocha';
import { expect } from 'chai';

describe('CodePosition', () => {
    describe('ctor', () => {
        it('creates with valid parameters', () => {
            // arrange
            const startPosition = 0;
            const endPosition = 5;
            // act
            const sut = new CodePosition(startPosition, endPosition);
            // assert
            expect(sut.startLine).to.equal(startPosition);
            expect(sut.endLine).to.equal(endPosition);
        });
        it('throws with negative start position', () => {
            // arrange
            const startPosition = -1;
            const endPosition = 5;
            // act
            const getSut = () => new CodePosition(startPosition, endPosition);
            // assert
            expect(getSut).to.throw('Code cannot start in a negative line');
        });
        it('throws with negative end position', () => {
            // arrange
            const startPosition = 1;
            const endPosition = -5;
            // act
            const getSut = () => new CodePosition(startPosition, endPosition);
            // assert
            expect(getSut).to.throw('Code cannot end in a negative line');
        });
        it('throws when start and end position is same', () => {
            // arrange
            const startPosition = 0;
            const endPosition = 0;
            // act
            const getSut = () => new CodePosition(startPosition, endPosition);
            // assert
            expect(getSut).to.throw('Empty code');
        });
        it('throws when ends before start', () => {
            // arrange
            const startPosition = 3;
            const endPosition = 2;
            // act
            const getSut = () => new CodePosition(startPosition, endPosition);
            // assert
            expect(getSut).to.throw('End line cannot be less than start line');
        });
    });
});
